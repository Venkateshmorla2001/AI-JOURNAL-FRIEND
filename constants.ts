import { Emotion } from './types';

export const POSITIVE_QUOTES = [
  "You are awesome, and you're capable of amazing things.",
  "Your potential is endless. Go do what you were created to do.",
  "Believe you can and you're halfway there. You've got this!",
  "The only person you are destined to become is the person you decide to be.",
  "Every day may not be good, but there is something good in every day. Find it and smile.",
  "You are a star, don't let anyone dull your sparkle!"
];

export const EMOJIS = ['😄', '😊', '😍', '😢', '😠', '🤔', '🙏', '🎉', '❤️', '✨', '🔥', '👍', '💡', '🥳', '😴', '😎', '✈️', '💼', '🏋️', '🧘', '🎂', '🎁', '🏖️', '⛰️'];

export const STICKERS: { name: string; emoji: string }[] = [
    { name: 'Workout', emoji: '💪' },
    { name: 'Work', emoji: '💼' },
    { name: 'Travel', emoji: '✈️' },
    { name: 'Relax', emoji: '🧘' },
    { name: 'Party', emoji: '🎉' },
    { name: 'Birthday', emoji: '🎂' },
    { name: 'Date Night', emoji: '❤️' },
    { name: 'Meeting', emoji: '👥' },
    { name: 'Coffee', emoji: '☕' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Reading', emoji: '📚' },
    { name: 'Gaming', emoji: '🎮' },
];


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