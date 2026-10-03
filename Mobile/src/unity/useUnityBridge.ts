import { useCallback, useEffect, useState } from 'react';
import { UnityBridge } from './UnityBridge';
import type { InboundMessage, OutboundMessage, UnityMode } from './types';

export interface UnityBridgeState {
  ready: boolean;
  tracking: 'found' | 'lost' | null;
  stateName: string | null;
  readout: { msr: number; csr: number; totalMm: number } | null;
  error: { code: string; message: string } | null;
}

const initial: UnityBridgeState = { ready: false, tracking: null, stateName: null, readout: null, error: null };

/** Subscribes to Unity messages and exposes the latest state plus the typed senders. */
export function useUnityBridge() {
  const [state, setState] = useState<UnityBridgeState>(initial);

  useEffect(() => {
    return UnityBridge.subscribe((msg: InboundMessage) => {
      setState((prev) => {
        switch (msg.type) {
          case 'ready':
            return { ...prev, ready: true };
          case 'tracking':
            return { ...prev, tracking: msg.state };
          case 'state':
            return { ...prev, stateName: msg.name };
          case 'readout':
            return { ...prev, readout: { msr: msg.msr, csr: msg.csr, totalMm: msg.totalMm } };
          case 'error':
            return { ...prev, error: { code: msg.code, message: msg.message } };
          default:
            return prev;
        }
      });
    });
  }, []);

  const open = useCallback((mode: UnityMode, experimentId: string) => UnityBridge.open(mode, experimentId), []);
  const close = useCallback(() => UnityBridge.close(), []);
  const send = useCallback((msg: OutboundMessage) => UnityBridge.send(msg), []);

  return { ...state, open, close, send };
}
