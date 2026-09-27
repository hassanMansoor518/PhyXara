import { ArrowLeft, Image as GalleryIcon, HelpCircle, Zap, ZapOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScannerStatus = 'READY' | 'SCANNING' | 'DETECTED' | 'FAILED' | 'LOADING';

interface ScanOverlayProps {
  onBack: () => void;
  onCapture: () => void;
  onGallery: () => void;
  onTips: () => void;
  flashMode: 'on' | 'off';
  onToggleFlash: () => void;
  status?: ScannerStatus;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  onBack,
  onCapture,
  onGallery,
  onTips,
  flashMode,
  onToggleFlash,
  status = 'READY',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Top Action Bar: Clean Light Floating Controls */}
      <View
        className="flex-row items-center justify-between px-5 z-10"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <Pressable
          onPress={onBack}
          className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-md active:bg-gray-100 border border-[#E2E8F0]"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>

        <View className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#E2E8F0] shadow-md flex-row items-center">
          <View
            className={`w-2.5 h-2.5 rounded-full mr-2 ${
              status === 'DETECTED'
                ? 'bg-[#16A34A]'
                : status === 'FAILED'
                ? 'bg-[#DC2626]'
                : status === 'SCANNING'
                ? 'bg-[#F59E0B]'
                : 'bg-[#2563EB]'
            }`}
          />
          <Text className="text-xs font-bold text-[#0F172A] tracking-wide">
            {status === 'READY'
              ? 'AR Scanner Ready'
              : status === 'SCANNING'
              ? 'Analyzing Diagram...'
              : status === 'DETECTED'
              ? 'Diagram Detected!'
              : 'AR Scanner'}
          </Text>
        </View>

        <Pressable
          onPress={onToggleFlash}
          className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-md active:bg-gray-100 border border-[#E2E8F0]"
        >
          {flashMode === 'on' ? (
            <Zap size={19} color="#F59E0B" fill="#F59E0B" />
          ) : (
            <ZapOff size={19} color="#64748B" />
          )}
        </Pressable>
      </View>

      {/* Center Viewfinder & Instructions */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Floating Instruction Card */}
        <View className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl mb-6 border border-[#E2E8F0] shadow-md items-center">
          <Text className="text-xs font-extrabold text-[#0F172A] text-center">
            Point your camera at a Physics diagram
          </Text>
          <Text className="text-[11px] font-medium text-[#64748B] text-center mt-0.5">
            Keep the diagram inside the frame
          </Text>
        </View>

        {/* Viewfinder Target Box with Light Accents & Tracking Points */}
        <View className="w-full aspect-[4/3] rounded-3xl border-2 border-white/80 overflow-hidden items-center justify-center relative bg-white/10 shadow-lg">
          {/* Corner Electric Blue Tracking Brackets */}
          <View className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-[#2563EB] rounded-tl-xl" />
          <View className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-[#2563EB] rounded-tr-xl" />
          <View className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-[#2563EB] rounded-bl-xl" />
          <View className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-[#2563EB] rounded-br-xl" />

          {/* AR Tracking Points Visualizer */}
          <View className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#06B6D4]" />
          <View className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-[#06B6D4]" />
          <View className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-[#06B6D4]" />
          <View className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-[#06B6D4]" />

          {/* Center Reticle */}
          <View className="w-14 h-14 border border-dashed border-white/80 rounded-full items-center justify-center bg-white/20">
            <View className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          </View>
        </View>
      </View>

      {/* Bottom Floating Controls Bar (White / Light Theme) */}
      <View
        className="px-6 z-10"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-[#E2E8F0] shadow-xl flex-row items-center justify-around">
          {/* Gallery Button */}
          <Pressable
            onPress={onGallery}
            className="items-center justify-center active:opacity-75"
          >
            <View className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center mb-1">
              <GalleryIcon size={20} color="#0F172A" />
            </View>
            <Text className="text-[11px] font-bold text-[#475569]">Gallery</Text>
          </Pressable>

          {/* Shutter Capture Button */}
          <Pressable
            onPress={onCapture}
            className="w-18 h-18 rounded-full bg-[#EFF6FF] items-center justify-center border-4 border-[#2563EB] active:scale-95 shadow-lg p-1"
          >
            <View className="w-14 h-14 rounded-full bg-[#2563EB] items-center justify-center shadow-md" />
          </Pressable>

          {/* Tips / Help Button */}
          <Pressable
            onPress={onTips}
            className="items-center justify-center active:opacity-75"
          >
            <View className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] items-center justify-center mb-1">
              <HelpCircle size={20} color="#0F172A" />
            </View>
            <Text className="text-[11px] font-bold text-[#475569]">Tips</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ScanOverlay;
