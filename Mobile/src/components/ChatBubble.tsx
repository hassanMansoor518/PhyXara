import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AIAvatarSvg } from './illustrations/AIAvatarSvg';
import { ElectricMotorFrontSvg } from './illustrations/ElectricMotorFrontSvg';
import { ChatMessage } from '../types';
import { router } from 'expo-router';
import { Eye } from 'lucide-react-native';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <View className="flex-row justify-end mb-4 px-4">
        <View className="bg-primary rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
          <Text className="text-sm text-white font-medium">{message.text}</Text>
          <Text className="text-[10px] text-white/70 text-right mt-1">{message.timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-start mb-4 px-4">
      <View className="mr-2.5 mt-1">
        <AIAvatarSvg size={36} />
      </View>

      <View className="flex-1">
        <View className="bg-white rounded-2xl rounded-tl-none p-4 border border-border max-w-[92%] shadow-sm">
          <Text className="text-sm text-navy leading-5">{message.text}</Text>

          {/* Optional inline 3D Motor Preview if mentioned */}
          {message.hasModelPreview && (
            <Pressable
              onPress={() => router.push('/motor-viewer')}
              className="mt-3 bg-background rounded-2xl p-3 border border-border flex-row items-center active:bg-gray-100"
            >
              <View className="w-14 h-12 bg-white rounded-xl items-center justify-center overflow-hidden border border-border mr-3">
                <ElectricMotorFrontSvg width={55} height={45} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-navy">Electric Motor 3D</Text>
                <Text className="text-[11px] text-primary font-medium mt-0.5 flex-row items-center">
                  Tap to view 3D Model →
                </Text>
              </View>
              <Eye size={16} color="#6C4DFF" />
            </Pressable>
          )}

          <Text className="text-[10px] text-muted text-right mt-1.5">{message.timestamp}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatBubble;
