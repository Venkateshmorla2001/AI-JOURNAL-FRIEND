export type JournalEntry = {
  id: string; // YYYY-MM-DD format
  date: string; // ISO String format
  content: string;
  analysis?: AIAnalysis;
  image?: string; // base64 encoded image
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type AuthState = {
  protection: 'enabled' | 'disabled' | 'unset';
  password?: string;
  rememberMe?: boolean;
};

export type AppSettings = {
  isMusicEnabled: boolean;
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

export type ChatHistory = Record<string, ChatMessage[]>; // Key is 'YYYY-MM-DD'

export type CalendarLabel = {
  type: 'emoji' | 'image' | 'sticker';
  value: string; // emoji character, base64 image string, or sticker name/ID
};

export type CalendarData = Record<string, CalendarLabel>; // Key is 'YYYY-MM-DD'


export type ThemeName = 'Twilight Nebula' | 'Sunset Glow' | 'Emerald Forest' | 'Oceanic Dream' | 'Cyberpunk Pulse';

export type Theme = {
  name: ThemeName;
  colors: {
    '--color-primary': string;
    '--color-primary-hover': string;
    '--color-primary-muted': string;
    '--color-secondary': string;
    '--color-secondary-muted': string;
    '--color-accent': string;
    '--color-text-primary': string;
    '--color-text-secondary': string;
    '--color-bg-primary': string;
    '--color-bg-secondary': string;
    '--color-border': string;
    '--color-gradient-from': string;
    '--color-gradient-via': string;
    '--color-gradient-to':string;
  };
};