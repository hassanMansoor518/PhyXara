import { AI_KNOWLEDGE_BASE, DEFAULT_AI_PROMPTS } from '../data/aiResponses';
import { ChatMessage } from '../types';

export const aiService = {
  askTutor: async (question: string): Promise<ChatMessage> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const normalized = question.toLowerCase();
    let bestMatch = AI_KNOWLEDGE_BASE[0];

    for (const item of AI_KNOWLEDGE_BASE) {
      if (item.keywords.some((kw) => normalized.includes(kw))) {
        bestMatch = item;
        break;
      }
    }

    return {
      id: Date.now().toString(),
      sender: 'tutor',
      text: bestMatch.response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasModelPreview: bestMatch.hasModelPreview,
    };
  },

  getSuggestedPrompts: (): string[] => {
    return DEFAULT_AI_PROMPTS;
  },
};

export default aiService;
