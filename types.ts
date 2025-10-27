
export type JournalEntry = {
  id: string;
  date: string;
  content: string;
  analysis?: AIAnalysis;
};

export type AIAnalysis = {
  emotion: Emotion;
  summary: string;
  suggestions: string[];
};

export enum Emotion {
  Joy = 'Joy',
  Gratitude = 'Gratitude',
  Love = 'Love',
  Optimism = 'Optimism',
  Sadness = 'Sadness',
  Anger = 'Anger',
  Fear = 'Fear',
  Neutral = 'Neutral',
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};
