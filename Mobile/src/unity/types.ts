// JSON message contract v1 between React Native and the Unity scene (AR_MODE/Assets/Scripts/Bridge).
export const CONTRACT_VERSION = 1 as const;

export type UnityMode = 'ar' | 'preview';
export type Lang = 'en' | 'ur';

// RN -> Unity
export type OutboundMessage =
  | { type: 'open'; mode: UnityMode; experimentId: string }
  | { type: 'playAnimation' }
  | { type: 'stopAnimation' }
  | { type: 'startPractical' }
  | { type: 'resetPractical' }
  | { type: 'setLanguage'; lang: Lang }
  | { type: 'stop' };

// Unity -> RN
export type InboundMessage =
  | { v: 1; type: 'ready' }
  | { v: 1; type: 'tracking'; state: 'found' | 'lost'; experimentId: string }
  | { v: 1; type: 'state'; name: string }
  | { v: 1; type: 'readout'; msr: number; csr: number; totalMm: number }
  | { v: 1; type: 'error'; code: string; message: string };

export type UnityMessageHandler = (msg: InboundMessage) => void;

export interface PendingOpen {
  mode: UnityMode;
  experimentId: string;
}
