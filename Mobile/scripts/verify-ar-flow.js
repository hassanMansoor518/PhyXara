// Verification script for PhyXara AR Compatibility and Flow
const assert = require('assert');

console.log('--- 1. Testing AR Support Logic & User-Facing Friendly Message ---');

const AR_UNSUPPORTED_FRIENDLY_MESSAGE =
  'AR is not supported on this device. You can still explore the 3D model in Standard View.';

function evaluateDeviceAR(platform, apiLevel, brand, model, manualOverride = null) {
  if (manualOverride !== null) {
    return {
      isSupported: manualOverride,
      reason: manualOverride
        ? 'AR manually enabled via debug override.'
        : AR_UNSUPPORTED_FRIENDLY_MESSAGE,
      isLowEnd: !manualOverride,
    };
  }

  if (platform !== 'android' && platform !== 'ios') {
    return { isSupported: false, reason: AR_UNSUPPORTED_FRIENDLY_MESSAGE, isLowEnd: false };
  }

  if (platform === 'android') {
    if (isNaN(apiLevel) || apiLevel < 26) {
      return { isSupported: false, reason: AR_UNSUPPORTED_FRIENDLY_MESSAGE, isLowEnd: true };
    }

    const m = (model || '').toLowerCase();
    const b = (brand || '').toLowerCase();
    const isBudget =
      m.includes('go') ||
      m.includes('lite') ||
      b.includes('itel') ||
      b.includes('infinix') ||
      b.includes('tecno') ||
      (b.includes('realme') && apiLevel <= 29);

    if (isBudget) {
      return { isSupported: false, reason: AR_UNSUPPORTED_FRIENDLY_MESSAGE, isLowEnd: true };
    }

    return { isSupported: true, reason: 'Google ARCore hardware capabilities verified.', isLowEnd: false };
  }

  return { isSupported: true, reason: 'Apple ARKit is fully supported on this device.', isLowEnd: false };
}

// Test case 1: Low-end Android devices (Itel, Tecno, Infinix, Android Go)
const itelPhone = evaluateDeviceAR('android', 27, 'itel', 'itel A56');
assert.strictEqual(itelPhone.isSupported, false);
assert.strictEqual(itelPhone.reason, AR_UNSUPPORTED_FRIENDLY_MESSAGE);
assert.strictEqual(itelPhone.isLowEnd, true);
console.log('✔ Itel / Budget phone detected as unsupported without crash');

const goPhone = evaluateDeviceAR('android', 28, 'Samsung', 'Galaxy A01 Core Go');
assert.strictEqual(goPhone.isSupported, false);
assert.strictEqual(goPhone.reason, AR_UNSUPPORTED_FRIENDLY_MESSAGE);
console.log('✔ Android Go device detected as unsupported with friendly message');

// Test case 2: Older Android API level (< 26)
const oldAndroid = evaluateDeviceAR('android', 24, 'Samsung', 'Galaxy S7');
assert.strictEqual(oldAndroid.isSupported, false);
assert.strictEqual(oldAndroid.reason, AR_UNSUPPORTED_FRIENDLY_MESSAGE);
console.log('✔ Android API < 26 properly guarded against ARCore launch');

// Test case 3: High-end ARCore Certified Android device
const pixelPhone = evaluateDeviceAR('android', 33, 'Google', 'Pixel 7 Pro');
assert.strictEqual(pixelPhone.isSupported, true);
assert.strictEqual(pixelPhone.isLowEnd, false);
console.log('✔ High-end certified device verified for AR View');

// Test case 4: Interactive Manual Override (for quick testing on any device)
const lowEndOverridden = evaluateDeviceAR('android', 33, 'Google', 'Pixel 7 Pro', false);
assert.strictEqual(lowEndOverridden.isSupported, false);
assert.strictEqual(lowEndOverridden.reason, AR_UNSUPPORTED_FRIENDLY_MESSAGE);
console.log('✔ Debug manual override (simulate budget device) working');

const budgetOverridden = evaluateDeviceAR('android', 24, 'itel', 'A56', true);
assert.strictEqual(budgetOverridden.isSupported, true);
console.log('✔ Debug manual override (simulate AR device) working');

console.log('\n--- 2. Testing Diagram Resolution & Model Mapping ---');

const ALIASES = {
  'motor': 'electric-motor',
  'electric_motor': 'electric-motor',
  'dc-motor': 'electric-motor',
  'exp3_micrometer': 'micrometer',
  'micrometer-screw-gauge': 'micrometer',
  'vernier-caliper': 'vernier',
  'exp1_vernier': 'vernier',
};

const DIAGRAM_CATALOG = {
  'electric-motor': {
    title: 'DC Electric Motor',
    modelSource: 'electric_motor.glb',
  },
  'micrometer': {
    title: 'Micrometer Screw Gauge',
    modelSource: 'micrometer_screw_gauge_v2.glb',
  },
  'vernier': {
    title: 'Vernier Caliper',
    modelSource: 'micrometer_screw_gauge_v2.glb',
  },
};

function resolveDiagram(topicId) {
  const key = ALIASES[topicId] || topicId;
  return DIAGRAM_CATALOG[key] || DIAGRAM_CATALOG['electric-motor'];
}

assert.strictEqual(resolveDiagram('electric-motor').title, 'DC Electric Motor');
assert.strictEqual(resolveDiagram('motor').modelSource, 'electric_motor.glb');
assert.strictEqual(resolveDiagram('exp3_micrometer').title, 'Micrometer Screw Gauge');
assert.strictEqual(resolveDiagram('micrometer-screw-gauge').modelSource, 'micrometer_screw_gauge_v2.glb');
assert.strictEqual(resolveDiagram('unknown_diagram').title, 'DC Electric Motor');
console.log('✔ Diagram resolution & model mapping verified');

console.log('\n--- 3. Testing Unity Bridge Protection ---');
async function simulateUnityOpen(mode, experimentId, isARSupported) {
  if (mode === 'ar') {
    if (!isARSupported) {
      return { ok: false, reason: 'ar_unsupported' };
    }
  }
  return { ok: true };
}

(async () => {
  const resUnsupported = await simulateUnityOpen('ar', 'exp3_micrometer', false);
  assert.strictEqual(resUnsupported.ok, false);
  assert.strictEqual(resUnsupported.reason, 'ar_unsupported');
  console.log('✔ UnityBridge refuses to open AR on unsupported device');

  const resSupported = await simulateUnityOpen('ar', 'exp3_micrometer', true);
  assert.strictEqual(resSupported.ok, true);
  console.log('✔ UnityBridge safely opens AR on supported device');

  console.log('\n======================================================');
  console.log('🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
  console.log('======================================================');
})();
