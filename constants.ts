
import { Emotion } from './types';

export const APP_PASSWORD = 'secure_password_123';

export const EMOTION_COLORS: Record<Emotion, string> = {
  [Emotion.Joy]: 'border-yellow-400 bg-yellow-400/10',
  [Emotion.Gratitude]: 'border-green-400 bg-green-400/10',
  [Emotion.Love]: 'border-pink-400 bg-pink-400/10',
  [Emotion.Optimism]: 'border-blue-400 bg-blue-400/10',
  [Emotion.Sadness]: 'border-indigo-400 bg-indigo-400/10',
  [Emotion.Anger]: 'border-red-400 bg-red-400/10',
  [Emotion.Fear]: 'border-purple-400 bg-purple-400/10',
  [Emotion.Neutral]: 'border-gray-500 bg-gray-500/10',
};

export const EMOTION_EMOJIS: Record<Emotion, string> = {
  [Emotion.Joy]: '😄',
  [Emotion.Gratitude]: '🙏',
  [Emotion.Love]: '❤️',
  [Emotion.Optimism]: '✨',
  [Emotion.Sadness]: '😢',
  [Emotion.Anger]: '😠',
  [Emotion.Fear]: '😨',
  [Emotion.Neutral]: '😐',
};
