/**
 * PhyXara Gemini Multi-Model Fallback Test Suite
 *
 * Tests all 12 required scenarios using mocked API responses.
 * Does NOT consume real API quota.
 *
 * Run: node server/geminiService.test.js
 */

const assert = require('assert');

// ─── Mock fetch globally before requiring geminiService ───

let fetchCallCount = 0;
let fetchMockResponses = [];
let fetchCallLog = [];

global.fetch = async (url, options) => {
  fetchCallCount++;
  const callIndex = fetchCallCount - 1;
  fetchCallLog.push({ url, options, index: callIndex });

  // Extract model name from URL for matching
  const modelMatch = url.match(/models\/([^:]+):/);
  const model = modelMatch ? modelMatch[1] : 'unknown';

  // Find the matching response in the mock queue
  let mockResponse;
  if (typeof fetchMockResponses === 'function') {
    mockResponse = fetchMockResponses(callIndex, model, url);
  } else if (fetchMockResponses.length > 0) {
    mockResponse = fetchMockResponses.shift();
  } else {
    mockResponse = {
      ok: false,
      status: 500,
      headers: new Map(),
      text: async () => 'No mock responses configured',
    };
  }

  // If mockResponse is an Error, throw it (simulating network failure)
  if (mockResponse instanceof Error) {
    throw mockResponse;
  }

  return mockResponse;
};

// Now require the service after mocking fetch
const {
  analyzeImageWithGemini,
  processDiagramScan,
  VERIFIED_3D_MODELS,
  PHYSICS_CATALOG,
  _testing,
} = require('./geminiService');

const {
  classifyError,
  calculateBackoffDelay,
  getModelList,
  getRetryConfig,
  isCircuitOpen,
  recordModelFailure,
  recordModelSuccess,
  modelCircuitBreaker,
  ERROR_CATEGORY,
  CIRCUIT_BREAKER_THRESHOLD,
} = _testing;

// ─── Test helpers ───

const FAKE_API_KEY = 'test-api-key-fake-12345';
const FAKE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makeSuccessResponse(diagramType = 'electric-motor') {
  const geminiOutput = JSON.stringify({
    recognized: true,
    diagramType,
    objectName: 'DC Electric Motor',
    confidence: 0.95,
    detectedComponents: ['Armature Coil', 'Magnets', 'Commutator'],
    principle: 'Electromagnetic torque',
    formula: 'τ = NIAB sin(θ)',
    reason: 'Visible coil, magnets, and commutator',
  });

  return {
    ok: true,
    status: 200,
    headers: new Map(),
    text: async () => JSON.stringify({
      candidates: [{ content: { parts: [{ text: geminiOutput }] } }],
    }),
  };
}

function makeErrorResponse(status, body = '', retryAfter = null) {
  const headers = new Map();
  if (retryAfter) headers.set('retry-after', retryAfter);
  return {
    ok: false,
    status,
    headers: { get: (key) => headers.get(key) },
    text: async () => body || `Error ${status}`,
  };
}

function resetMocks() {
  fetchCallCount = 0;
  fetchMockResponses = [];
  fetchCallLog = [];
  modelCircuitBreaker.clear();
}

// Override env for tests to use fast retries
process.env.GEMINI_PRIMARY_MODEL = 'gemini-3.8-flash';
process.env.GEMINI_FALLBACK_MODELS = 'gemini-3.5-flash,gemini-2.5-flash';
process.env.GEMINI_MAX_RETRIES = '1';
process.env.GEMINI_RETRY_BASE_DELAY_MS = '10';    // Fast for tests
process.env.GEMINI_RETRY_MAX_DELAY_MS = '50';
process.env.GEMINI_REQUEST_TIMEOUT_MS = '5000';
process.env.GEMINI_TOTAL_TIMEOUT_MS = '30000';

// ─── Test runner ───

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  PhyXara Gemini Fallback Test Suite');
  console.log('══════════════════════════════════════════════════════\n');

  for (const { name, fn } of tests) {
    resetMocks();
    try {
      await fn();
      passed++;
      console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
      failed++;
      console.log(`  ❌ FAIL: ${name}`);
      console.log(`          ${err.message}`);
    }
  }

  console.log('\n──────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${tests.length} total`);
  console.log('──────────────────────────────────────────────────────\n');

  process.exit(failed > 0 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Test Cases
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Primary model succeeds
test('Primary model succeeds on first try', async () => {
  fetchMockResponses = [makeSuccessResponse('electric-motor')];
  const result = await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramType, 'electric-motor');
  assert.strictEqual(fetchCallCount, 1, 'Should only make 1 API call');
});

// 2. Primary model returns 503; retry succeeds
test('Primary model 503 then retry succeeds', async () => {
  fetchMockResponses = [
    makeErrorResponse(503, 'Service temporarily unavailable'),
    makeSuccessResponse('micrometer'),
  ];
  const result = await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramType, 'micrometer');
  assert.strictEqual(fetchCallCount, 2, 'Should retry once on 503');
});

// 3. Primary model repeatedly returns 503; fallback model succeeds
test('Primary 503 exhausted, fallback model succeeds', async () => {
  fetchMockResponses = (callIndex, model) => {
    if (model === 'gemini-3.8-flash') {
      return makeErrorResponse(503, 'This model is currently experiencing high demand');
    }
    if (model === 'gemini-3.5-flash') {
      return makeSuccessResponse('circuit');
    }
    return makeErrorResponse(503, 'Still busy');
  };
  const result = await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramType, 'circuit');
  // Primary should be tried maxRetries+1 times (2), then fallback should succeed
  assert.ok(fetchCallCount >= 3, `Expected >= 3 calls, got ${fetchCallCount}`);
});

// 4. Primary model returns 429 quota exhaustion; fallback succeeds
test('Primary 429 quota exhaustion, immediate fallback', async () => {
  fetchMockResponses = (callIndex, model) => {
    if (model === 'gemini-3.8-flash') {
      return makeErrorResponse(429, 'Resource has been exhausted. Quota exceeded.');
    }
    if (model === 'gemini-3.5-flash') {
      return makeSuccessResponse('transformer');
    }
    return makeErrorResponse(429, 'quota');
  };
  const result = await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramType, 'transformer');
  // Should NOT retry the primary model multiple times for quota — should switch immediately
  const primaryCalls = fetchCallLog.filter(c => c.url.includes('gemini-3.8-flash')).length;
  assert.strictEqual(primaryCalls, 1, `Quota exhaustion should not retry same model, got ${primaryCalls} calls`);
});

// 5. One fallback fails and a later fallback succeeds
test('First fallback fails, second fallback succeeds', async () => {
  fetchMockResponses = (callIndex, model) => {
    if (model === 'gemini-3.8-flash') {
      return makeErrorResponse(503, 'Unavailable');
    }
    if (model === 'gemini-3.5-flash') {
      return makeErrorResponse(404, 'Model not found');
    }
    if (model === 'gemini-2.5-flash') {
      return makeSuccessResponse('vernier');
    }
    return makeErrorResponse(500, 'Error');
  };
  const result = await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramType, 'vernier');
});

// 6. Every model fails
test('All models fail throws comprehensive error', async () => {
  fetchMockResponses = () => makeErrorResponse(503, 'Overloaded');
  try {
    await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(
      err.message.includes('unavailable') || err.message.includes('All'),
      `Error message should indicate all models failed: ${err.message}`
    );
    assert.ok(err.attemptLog, 'Should include attemptLog');
    assert.ok(err.attemptLog.length > 0, 'attemptLog should not be empty');
  }
});

// 7. Invalid API key / permission error does not trigger pointless retries
test('401 auth error aborts immediately without trying fallback models', async () => {
  fetchMockResponses = [
    makeErrorResponse(401, 'API key not valid. Please pass a valid API key.'),
  ];
  try {
    await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(err.message.includes('authentication'), `Got: ${err.message}`);
    assert.strictEqual(fetchCallCount, 1, 'Should NOT try other models after auth error');
  }
});

// 8. Invalid request (400) does not trigger endless fallback
test('400 bad request aborts without retrying or falling back', async () => {
  fetchMockResponses = [
    makeErrorResponse(400, 'Invalid argument: image format not supported'),
  ];
  try {
    await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
    assert.fail('Should have thrown');
  } catch (err) {
    assert.ok(err.message.includes('rejected'), `Got: ${err.message}`);
    assert.strictEqual(fetchCallCount, 1, 'Should NOT retry on 400');
  }
});

// 9. Malformed model output is handled safely
test('Malformed JSON output retries then fails gracefully', async () => {
  // Return invalid JSON from all models
  fetchMockResponses = () => ({
    ok: true,
    status: 200,
    headers: new Map(),
    text: async () => JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'This is not valid JSON {{{' }] } }],
    }),
  });

  try {
    await analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
    assert.fail('Should have thrown on malformed JSON');
  } catch (err) {
    assert.ok(
      err.message.includes('unparseable') || err.message.includes('unavailable') || err.message.includes('All'),
      `Error should mention parse failure or exhaustion: ${err.message}`
    );
  }
});

// 10. Concurrent requests do not create infinite loops
test('Concurrent requests resolve independently', async () => {
  let callCounter = 0;
  fetchMockResponses = () => {
    callCounter++;
    if (callCounter <= 6) {
      // First few calls: 503 for primary, then success for fallback
      return makeErrorResponse(503, 'Busy');
    }
    return makeSuccessResponse('generator');
  };

  // Run 3 concurrent requests
  const promises = [
    analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY).catch(e => ({ error: e.message })),
    analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY).catch(e => ({ error: e.message })),
    analyzeImageWithGemini(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY).catch(e => ({ error: e.message })),
  ];

  const results = await Promise.all(promises);
  // At least some should complete (success or structured failure, not infinite hang)
  assert.strictEqual(results.length, 3, 'All 3 concurrent requests should resolve');
  for (const r of results) {
    assert.ok(
      r.diagramType || r.error,
      'Each result should be a success or a structured error'
    );
  }
});

// 11. Existing diagram scan response structure remains unchanged
test('processDiagramScan returns expected response structure', async () => {
  fetchMockResponses = [makeSuccessResponse('electric-motor')];
  const result = await processDiagramScan(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);

  // Verify all expected fields exist
  const requiredFields = [
    'success', 'recognized', 'diagramId', 'name', 'title',
    'chapter', 'board', 'confidence', 'components', 'principle',
    'formula', 'has3DModel', 'modelKey', 'modelName', 'statusNotice',
    'geminiReason',
  ];

  for (const field of requiredFields) {
    assert.ok(field in result, `Response missing required field: ${field}`);
  }

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.recognized, true);
  assert.strictEqual(result.diagramId, 'electric-motor');
  assert.ok(Array.isArray(result.components), 'components should be an array');
});

// 12. Frontend receives a useful error when all models fail
test('processDiagramScan returns user-friendly error on total failure', async () => {
  fetchMockResponses = () => makeErrorResponse(503, 'Overloaded');
  try {
    await processDiagramScan(FAKE_BASE64, 'image/jpeg', FAKE_API_KEY);
    assert.fail('Should have thrown');
  } catch (err) {
    // The error should be catchable by the server's try/catch and converted to a user-friendly response
    assert.ok(err.message, 'Error should have a message');
    assert.ok(
      !err.message.includes(FAKE_API_KEY),
      'Error should NOT contain the API key'
    );
  }
});

// ─── Unit tests for helper functions ───

test('classifyError correctly categorizes HTTP statuses', () => {
  assert.strictEqual(classifyError(new Error(''), 401, ''), ERROR_CATEGORY.AUTH_ERROR);
  assert.strictEqual(classifyError(new Error(''), 403, ''), ERROR_CATEGORY.AUTH_ERROR);
  assert.strictEqual(classifyError(new Error(''), 400, ''), ERROR_CATEGORY.BAD_REQUEST);
  assert.strictEqual(classifyError(new Error(''), 404, ''), ERROR_CATEGORY.MODEL_NOT_FOUND);
  assert.strictEqual(classifyError(new Error(''), 429, 'Rate limit'), ERROR_CATEGORY.RATE_LIMITED);
  assert.strictEqual(classifyError(new Error(''), 429, 'resource_exhausted quota'), ERROR_CATEGORY.QUOTA_EXHAUSTED);
  assert.strictEqual(classifyError(new Error(''), 503, ''), ERROR_CATEGORY.TRANSIENT);
  assert.strictEqual(classifyError(new Error(''), 500, ''), ERROR_CATEGORY.TRANSIENT);
  assert.strictEqual(classifyError(new Error('fetch failed'), null, ''), ERROR_CATEGORY.NETWORK_ERROR);
});

test('calculateBackoffDelay respects Retry-After header', () => {
  const delay = calculateBackoffDelay(0, 1000, 10000, '5');
  assert.strictEqual(delay, 5000, 'Should use Retry-After value');
});

test('calculateBackoffDelay increases exponentially', () => {
  // With fixed seed-like behavior, at least verify the order of magnitude
  const d0 = calculateBackoffDelay(0, 1000, 30000, null);
  const d2 = calculateBackoffDelay(2, 1000, 30000, null);
  // d0 ~= 1000 ± 250, d2 ~= 4000 ± 1000
  assert.ok(d0 >= 500 && d0 <= 1500, `d0=${d0} should be ~1000`);
  assert.ok(d2 >= 2500 && d2 <= 5500, `d2=${d2} should be ~4000`);
});

test('getModelList returns primary + fallbacks from env', () => {
  const models = getModelList();
  assert.strictEqual(models[0], 'gemini-3.8-flash');
  assert.ok(models.includes('gemini-3.5-flash'));
  assert.ok(models.includes('gemini-2.5-flash'));
  // No duplicates
  const unique = new Set(models);
  assert.strictEqual(unique.size, models.length, 'No duplicate models');
});

test('Circuit breaker opens after threshold failures', () => {
  const testModel = 'test-circuit-model';
  for (let i = 0; i < CIRCUIT_BREAKER_THRESHOLD; i++) {
    recordModelFailure(testModel);
  }
  assert.strictEqual(isCircuitOpen(testModel), true, 'Circuit should be open');
  recordModelSuccess(testModel);
  assert.strictEqual(isCircuitOpen(testModel), false, 'Circuit should be closed after success');
});

// ─── Run ───
runTests();
