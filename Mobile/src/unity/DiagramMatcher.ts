import { unityConfig } from './config';

export interface MatchResult {
  experimentId: string;
  confidence: number;
}

export interface DiagramMatcher {
  /** Returns null when the image is not a known diagram. */
  match(imageUri: string): Promise<MatchResult | null>;
}

/** Dev only: every image is the micrometer diagram. */
export class MockMatcher implements DiagramMatcher {
  async match(): Promise<MatchResult | null> {
    return { experimentId: 'exp3_micrometer', confidence: 1 };
  }
}

/**
 * POSTs the image as multipart/form-data (field "image") to unityConfig.matchUrl and expects
 * { "experimentId": string, "confidence": number }. See src/unity/README.md.
 */
export class RemoteMatcher implements DiagramMatcher {
  constructor(private readonly url: string) {}

  async match(imageUri: string): Promise<MatchResult | null> {
    if (!this.url) {
      console.warn('[DiagramMatcher] EXPO_PUBLIC_DIAGRAM_MATCH_URL is not set');
      return null;
    }
    const form = new FormData();
    // React Native's FormData accepts { uri, name, type } for files.
    form.append('image', { uri: imageUri, name: 'diagram.jpg', type: 'image/jpeg' } as unknown as Blob);

    const res = await fetch(this.url, { method: 'POST', body: form, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Diagram matcher responded ${res.status}`);

    const body = (await res.json()) as Partial<MatchResult> | null;
    if (!body || typeof body.experimentId !== 'string' || typeof body.confidence !== 'number') return null;
    return { experimentId: body.experimentId, confidence: body.confidence };
  }
}

export function createDiagramMatcher(): DiagramMatcher {
  if (unityConfig.matcher === 'mock') {
    if (__DEV__) return new MockMatcher();
    console.warn('[DiagramMatcher] mock matcher requested in a release build, using remote');
  }
  return new RemoteMatcher(unityConfig.matchUrl);
}

export const DiagramMatcherService = {
  matcher: createDiagramMatcher(),

  /** match() plus the confidence gate. Returns null for "not recognised" or any failure. */
  async match(imageUri: string): Promise<MatchResult | null> {
    try {
      const result = await this.matcher.match(imageUri);
      if (!result || result.confidence < unityConfig.minConfidence) return null;
      return result;
    } catch (e) {
      console.warn('[DiagramMatcher] match failed', e);
      return null;
    }
  },
};
