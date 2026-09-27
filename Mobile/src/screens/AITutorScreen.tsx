import { AlertCircle, RefreshCw, Send, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { ChatBubble } from '../components/ChatBubble';
import { aiService } from '../services/aiService';
import { ChatMessage } from '../types';

export const AITutorScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'tutor',
      text: 'Hello! I am your AI Physics Tutor. Ask me any question about physics concepts, Sindh Board diagrams, formulas, or step-by-step numerical solutions.',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Why does the projectile move in a curved path?',
      timestamp: '10:01 AM',
    },
    {
      id: '3',
      sender: 'tutor',
      text: 'A projectile moves in a parabolic curve because it is influenced by two independent motions simultaneously:\n\n1. **Horizontal Motion:** Constant velocity (zero horizontal acceleration, ignoring air resistance).\n2. **Vertical Motion:** Constant downward acceleration due to gravity (g = 9.8 m/s²).\n\nThe combination of uniform horizontal motion and accelerated vertical motion creates a parabolic trajectory!',
      timestamp: '10:01 AM',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedPrompts = [
    'Explain simply',
    'Give an example',
    'Show formula',
    'Explain step by step',
    'How does an electric motor work?',
    "What is Fleming's Left-Hand Rule?",
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping, hasError]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setHasError(false);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiService.askTutor(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      setHasError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="AI Physics Tutor"
        rightIcon="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-between"
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <View className="flex-row items-center px-5 py-2">
              <View className="w-8 h-8 rounded-full bg-[#EFF6FF] items-center justify-center mr-2 border border-[#DBEAFE]">
                <Sparkles size={14} color="#2563EB" />
              </View>
              <Text className="text-xs text-[#64748B] italic">Tutor is generating explanation...</Text>
            </View>
          )}

          {hasError && (
            <View className="mx-5 my-2 p-3.5 bg-red-50 rounded-2xl border border-red-200 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                <AlertCircle size={16} color="#DC2626" />
                <Text className="text-xs text-[#DC2626] font-semibold ml-2">
                  Failed to load response. Please check your connection.
                </Text>
              </View>
              <Pressable
                onPress={handleRetry}
                className="bg-white px-2.5 py-1 rounded-lg border border-red-200 flex-row items-center"
              >
                <RefreshCw size={12} color="#DC2626" />
                <Text className="text-[11px] font-bold text-[#DC2626] ml-1">Retry</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View className="py-2.5 px-4 bg-white border-t border-[#E2E8F0]">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {suggestedPrompts.map((prompt, index) => (
              <Pressable
                key={index}
                onPress={() => handleSend(prompt)}
                className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-full px-3.5 py-1.5 mr-2 active:bg-[#DBEAFE]"
              >
                <Text className="text-xs font-bold text-[#2563EB]">{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Chat Input */}
        <View className="px-4 py-3 bg-white border-t border-[#E2E8F0] flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a physics question..."
            placeholderTextColor="#64748B"
            className="flex-1 bg-[#F8FAFC] rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] mr-2.5 border border-[#E2E8F0]"
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />

          <Pressable
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-sm ${
              inputText.trim() && !isTyping ? 'bg-[#2563EB] active:bg-[#1D4ED8]' : 'bg-[#E2E8F0]'
            }`}
          >
            <Send size={18} color={inputText.trim() && !isTyping ? '#FFFFFF' : '#94A3B8'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AITutorScreen;
