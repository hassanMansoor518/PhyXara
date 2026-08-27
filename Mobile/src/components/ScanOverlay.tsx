import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Zap, ZapOff, Image as GalleryIcon, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScanOverlayProps {
  onBack: () => void;
  onCapture: () => void;
  onGallery: () => void;
  onTips: () => void;
  flashMode: 'on' | 'off';
  onToggleFlash: () => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  onBack,
  onCapture,
  onGallery,
  onTips,
  flashMode,
  onToggleFlash,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Top action bar */}
      <View
        className="flex-row items-center justify-between px-6 z-10"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center active:bg-black/60 border border-white/20"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>

        <Text className="text-base font-bold text-white tracking-wide">AR Scanner</Text>

        <Pressable
          onPress={onToggleFlash}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center active:bg-black/60 border border-white/20"
        >
          {flashMode === 'on' ? (
            <Zap size={18} color="#FFB020" fill="#FFB020" />
          ) : (
            <ZapOff size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      {/* Center Reticle / Scanning Frame */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Instruction pill on top */}
        <View className="bg-black/60 px-5 py-2.5 rounded-full mb-6 border border-white/10 shadow-md">
          <Text className="text-xs font-semibold text-white/90 text-center">
            Point your camera at the diagram
          </Text>
        </View>

        {/* Viewfinder Target Box */}
        <View className="w-full aspect-[4/3] rounded-3xl border-2 border-white/40 overflow-hidden items-center justify-center relative bg-white/5">
          {/* Corner Brackets */}
          <View className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-cyan rounded-tl-xl" />
          <View className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-cyan rounded-tr-xl" />
          <View className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-cyan rounded-bl-xl" />
          <View className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-cyan rounded-br-xl" />

          {/* Center Target Mark */}
          <View className="w-12 h-12 border border-dashed border-white/40 rounded-full items-center justify-center" />
        </View>
      </View>

      {/* Bottom Controls Bar */}
      <View
        className="flex-row items-center justify-around px-8 z-10"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Gallery */}
        <Pressable
          onPress={onGallery}
          className="items-center justify-center active:opacity-75"
        >
          <View className="w-12 h-12 rounded-full bg-black/40 border border-white/20 items-center justify-center mb-1">
            <GalleryIcon size={20} color="#FFFFFF" />
          </View>
          <Text className="text-[11px] font-medium text-white">Gallery</Text>
        </Pressable>

        {/* Shutter Capture Button */}
        <Pressable
          onPress={onCapture}
          className="w-20 h-20 rounded-full bg-white/20 items-center justify-center border-2 border-white/60 active:scale-95 shadow-xl"
        >
          <View className="w-16 h-16 rounded-full bg-white shadow-md items-center justify-center" />
        </Pressable>

        {/* Tips */}
        <Pressable
          onPress={onTips}
          className="items-center justify-center active:opacity-75"
        >
          <View className="w-12 h-12 rounded-full bg-black/40 border border-white/20 items-center justify-center mb-1">
            <Info size={20} color="#FFFFFF" />
          </View>
          <Text className="text-[11px] font-medium text-white">Tips</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ScanOverlay;
