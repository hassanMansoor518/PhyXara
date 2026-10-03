import UnityView from '@azesmway/react-native-unity';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UnityBridge } from './UnityBridge';

/** Full-screen host for the Unity view: the view plus the app's usual round back button, nothing else. */
export const UnityHostScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const unityRef = useRef<UnityView>(null);

  useEffect(() => {
    UnityBridge.attach(unityRef);
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      UnityBridge.close(); // sends {"type":"stop"} then pops this screen
      return true;
    });
    return () => {
      sub.remove();
      // Also covers swipe-back / programmatic pops. Unity is left loaded (parked) for the next open;
      // it cannot be unloaded and booted again in the same process.
      UnityBridge.send({ type: 'stop' });
      UnityBridge.detach();
    };
  }, []);

  return (
    <View style={styles.root}>
      <UnityView
        ref={unityRef}
        style={StyleSheet.absoluteFill}
        onUnityMessage={(e) => UnityBridge.handleNativeMessage(e.nativeEvent.message)}
      />
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 16) }]} pointerEvents="box-none">
        <Pressable
          onPress={() => UnityBridge.close()}
          className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-md active:bg-gray-100 border border-[#E2E8F0]"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { position: 'absolute', top: 0, left: 20, right: 20 },
});

export default UnityHostScreen;
