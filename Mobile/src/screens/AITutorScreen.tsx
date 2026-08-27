import { Send, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
      text: 'Hi! I am your Physics AI Tutor. Ask me anything about this topic.',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      sender: 'user',
      text: 'How does an electric motor work?',
      timestamp: '10:01 AM',
    },
    {
      id: '3',
      sender: 'tutor',
      text: 'An electric motor works on the principle that when a current-carrying conductor is placed in a magnetic field, it experiences a force. This force causes the coil to rotate continuously.',
      timestamp: '10:01 AM',
      hasModelPreview: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedPrompts = aiService.getSuggestedPrompts();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

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
      // fallback
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="AI Tutor"
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
            <View className="flex-row items-center px-6 py-2">
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2">
                <Sparkles size={14} color="#6C4DFF" />
              </View>
              <Text className="text-xs text-muted italic">Tutor is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View className="py-2 px-4 bg-background">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {suggestedPrompts.map((prompt, index) => (
              <Pressable
                key={index}
                onPress={() => handleSend(prompt)}
                className="bg-white border border-primary/20 rounded-full px-3.5 py-1.5 mr-2 active:bg-primary-subtle shadow-sm"
              >
                <Text className="text-xs font-semibold text-primary">{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Chat Input */}
        <View className="px-4 py-3 bg-white border-t border-border flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
            placeholderTextColor="#737A96"
            className="flex-1 bg-background rounded-2xl px-4 py-2.5 text-sm text-navy mr-2 border border-border"
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />

          <Pressable
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-sm ${inputText.trim() ? 'bg-primary active:bg-primary-dark' : 'bg-gray-200'
              }`}
          >
            <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#94A3B8'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AITutorScreen;
