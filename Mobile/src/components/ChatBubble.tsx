import { router } from 'expo-router';
import { Eye } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChatMessage } from '../types';
import { AIAvatarSvg } from './illustrations/AIAvatarSvg';
import { ElectricMotorFrontSvg } from './illustrations/ElectricMotorFrontSvg';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <View className="flex-row justify-end mb-4 px-4">
        <View className="bg-[#2563EB] rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
          <Text className="text-sm text-white font-medium leading-5">{message.text}</Text>
          <Text className="text-[10px] text-white/70 text-right mt-1">{message.timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-start mb-4 px-4">
      <View className="mr-2.5 mt-0.5">
        <AIAvatarSvg size={34} />
      </View>

      <View className="flex-1">
        <View className="bg-[#F0F7FF] rounded-2xl rounded-tl-none p-4 border border-[#DBEAFE] max-w-[92%] shadow-sm">
          <Text className="text-sm text-[#0F172A] leading-5">{message.text}</Text>

          {/* Optional inline 3D Motor Preview if mentioned */}
          {message.hasModelPreview && (
            <Pressable
              onPress={() => router.push('/motor-viewer')}
              className="mt-3 bg-white rounded-2xl p-3 border border-[#DBEAFE] flex-row items-center active:bg-gray-50 shadow-sm"
            >
              <View className="w-14 h-12 bg-[#F8FAFC] rounded-xl items-center justify-center overflow-hidden border border-[#E2E8F0] mr-3">
                <ElectricMotorFrontSvg width={55} height={45} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#0F172A]">Electric Motor 3D Model</Text>
                <Text className="text-[11px] text-[#2563EB] font-bold mt-0.5">
                  Tap to view 3D Simulation →
                </Text>
              </View>
              <Eye size={16} color="#2563EB" />
            </Pressable>
          )}

          <Text className="text-[10px] text-[#64748B] text-right mt-1.5">{message.timestamp}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatBubble;
