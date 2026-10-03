import { Camera } from 'expo-camera';
import { router } from 'expo-router';
import type UnityView from '@azesmway/react-native-unity';
import type { RefObject } from 'react';
import {
  CONTRACT_VERSION,
  InboundMessage,
  OutboundMessage,
  PendingOpen,
  UnityMessageHandler,
  UnityMode,
} from './types';

const UNITY_OBJECT = 'RNBridge';
const UNITY_METHOD = 'OnMessage';
export const UNITY_ROUTE = '/unity';

export type OpenResult = { ok: true } | { ok: false; reason: 'camera_denied' | 'busy' };

/**
 * Typed wrapper around the Unity view. A single Unity player lives in the process (Unity as a
 * Library cannot be booted twice), so this is a module singleton:
 *   open()  -> checks CAMERA (ar mode), stores the request, pushes the host screen
 *   host screen mounts <UnityView>, calls attach(ref); the open message is sent once Unity is ready
 *   close() -> sends {"type":"stop"} (Unity ends the AR session and frees the camera) and pops the screen
 */
class UnityBridgeImpl {
  private viewRef: RefObject<UnityView | null> | null = null;
  private handlers = new Set<UnityMessageHandler>();
  private pending: PendingOpen | null = null;
  private unityReady = false;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private opening = false;

  async open(mode: UnityMode, experimentId: string): Promise<OpenResult> {
    if (this.opening) return { ok: false, reason: 'busy' };

    if (mode === 'ar') {
      // The scanner's expo-camera view must be unmounted (it is, once it loses focus) before Unity starts.
      const permission = await Camera.getCameraPermissionsAsync();
      const granted = permission.granted || (await Camera.requestCameraPermissionsAsync()).granted;
      if (!granted) return { ok: false, reason: 'camera_denied' };
    }

    this.opening = true;
    this.pending = { mode, experimentId };
    router.push(UNITY_ROUTE as never);
    return { ok: true };
  }

  /** Stop the Unity session and leave the host screen. Safe to call more than once. */
  close(): void {
    this.cancelFallback();
    this.pending = null;
    this.send({ type: 'stop' });
    this.opening = false;
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }

  send(msg: OutboundMessage): void {
    const view = this.viewRef?.current;
    if (!view) {
      console.warn('[UnityBridge] send dropped, no Unity view attached:', msg.type);
      return;
    }
    view.postMessage(UNITY_OBJECT, UNITY_METHOD, JSON.stringify({ v: CONTRACT_VERSION, ...msg }));
  }

  subscribe(handler: UnityMessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  // ---- used by the host screen ----

  attach(ref: RefObject<UnityView | null>): void {
    this.viewRef = ref;
    // Player may already be running from an earlier session (no 'ready' will come), or the 'ready'
    // event may have fired before JS was listening: send anyway after a grace period. open is idempotent in Unity.
    this.cancelFallback();
    this.fallbackTimer = setTimeout(() => this.flushOpen(), this.unityReady ? 150 : 2500);
  }

  detach(): void {
    this.cancelFallback();
    this.viewRef = null;
    this.opening = false;
  }

  handleNativeMessage(raw: string): void {
    let msg: InboundMessage;
    try {
      msg = JSON.parse(raw) as InboundMessage;
    } catch {
      console.warn('[UnityBridge] non-JSON message from Unity:', raw);
      return;
    }
    if (msg.type === 'ready') {
      this.unityReady = true;
      this.flushOpen();
    }
    this.handlers.forEach((h) => h(msg));
  }

  private flushOpen(): void {
    this.cancelFallback();
    if (!this.pending) return;
    this.send({ type: 'open', mode: this.pending.mode, experimentId: this.pending.experimentId });
  }

  private cancelFallback(): void {
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    this.fallbackTimer = null;
  }
}

export const UnityBridge = new UnityBridgeImpl();
