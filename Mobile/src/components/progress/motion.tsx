import { useIsFocused } from 'expo-router';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleProp, ViewStyle } from 'react-native';

export function useProgressMotion() {
  const focused = useIsFocused();
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return focused && !reduced;
}

export function Floating({ children, enabled, style, delay = 0 }: PropsWithChildren<{ enabled: boolean; style?: StyleProp<ViewStyle>; delay?: number }>) {
  const [offset] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!enabled) { offset.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(offset, { toValue: -4, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(offset, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [enabled, delay, offset]);
  return <Animated.View style={[style, { transform: [{ translateY: offset }] }]}>{children}</Animated.View>;
}

export function useAnimatedProgress(target: number, enabled: boolean) {
  const [value] = useState(() => new Animated.Value(0));
  const [count, setCount] = useState(target);
  useEffect(() => {
    const listener = value.addListener(({ value: current }) => setCount(current));
    const animation = Animated.timing(value, { toValue: target, duration: enabled ? 900 : 0, easing: Easing.out(Easing.cubic), useNativeDriver: false, isInteraction: false });
    animation.start();
    return () => { animation.stop(); value.removeListener(listener); };
  }, [enabled, target, value]);
  return { value, count };
}
