import { Theme } from './types';

export const themes: Theme[] = [
  {
    name: 'Twilight Nebula', // Liquid Glass Theme
    colors: {
        '--color-primary': '#60a5fa', // blue-400
        '--color-primary-hover': '#3b82f6', // blue-500
        '--color-primary-muted': 'rgba(96, 165, 250, 0.5)',
        '--color-secondary': '#a78bfa', // violet-400
        '--color-secondary-muted': 'rgba(167, 139, 250, 0.4)',
        '--color-accent': '#4ade80', // green-400
        '--color-text-primary': '#e5e7eb', // gray-200
        '--color-text-secondary': '#9ca3af', // gray-400
        '--color-bg-primary': '#030712', // gray-950
        '--color-bg-secondary': 'rgba(255, 255, 255, 0.07)',
        '--color-border': 'rgba(255, 255, 255, 0.1)',
        '--color-gradient-from': '#1e3a8a', // blue-900
        '--color-gradient-via': '#1e1b4b', // indigo-950
        '--color-gradient-to': '#064e3b', // green-900
    },
  },
  {
    name: 'Sunset Glow',
    colors: {
        '--color-primary': '#f97316', // orange-500
        '--color-primary-hover': '#ea580c', // orange-600
        '--color-primary-muted': 'rgba(249, 115, 22, 0.8)',
        '--color-secondary': '#dc2626', // red-600
        '--color-secondary-muted': 'rgba(220, 38, 38, 0.5)',
        '--color-accent': '#facc15', // yellow-400
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#d1d5db',
        '--color-bg-primary': '#1c1917', // stone-900
        '--color-bg-secondary': 'rgba(255, 255, 255, 0.1)',
        '--color-border': 'rgba(255, 255, 255, 0.2)',
        '--color-gradient-from': '#7f1d1d', // red-900
        '--color-gradient-via': '#854d0e', // yellow-800
        '--color-gradient-to': '#7c2d12', // orange-900
    },
  },
  {
    name: 'Emerald Forest',
    colors: {
        '--color-primary': '#10b981', // emerald-500
        '--color-primary-hover': '#059669', // emerald-600
        '--color-primary-muted': 'rgba(16, 185, 129, 0.8)',
        '--color-secondary': '#0d9488', // teal-600
        '--color-secondary-muted': 'rgba(13, 148, 136, 0.5)',
        '--color-accent': '#a3e635', // lime-400
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#d1d5db',
        '--color-bg-primary': '#18181b', // zinc-900
        '--color-bg-secondary': 'rgba(255, 255, 255, 0.1)',
        '--color-border': 'rgba(255, 255, 255, 0.2)',
        '--color-gradient-from': '#064e3b', // green-900
        '--color-gradient-via': '#134e4a', // teal-900
        '--color-gradient-to': '#172554', // blue-950
    },
  },
  {
    name: 'Oceanic Dream',
    colors: {
        '--color-primary': '#38bdf8', // sky-400
        '--color-primary-hover': '#0ea5e9', // sky-500
        '--color-primary-muted': 'rgba(56, 189, 248, 0.8)',
        '--color-secondary': '#3b82f6', // blue-500
        '--color-secondary-muted': 'rgba(59, 130, 246, 0.5)',
        '--color-accent': '#22d3ee', // cyan-400
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#d1d5db',
        '--color-bg-primary': '#1e293b', // slate-800
        '--color-bg-secondary': 'rgba(255, 255, 255, 0.1)',
        '--color-border': 'rgba(255, 255, 255, 0.2)',
        '--color-gradient-from': '#1e3a8a', // blue-900
        '--color-gradient-via': '#164e63', // cyan-900
        '--color-gradient-to': '#312e81', // indigo-900
    },
  },
  {
    name: 'Cyberpunk Pulse',
    colors: {
        '--color-primary': '#d946ef', // fuchsia-500
        '--color-primary-hover': '#c026d3', // fuchsia-600
        '--color-primary-muted': 'rgba(217, 70, 239, 0.8)',
        '--color-secondary': '#a855f7', // purple-500
        '--color-secondary-muted': 'rgba(168, 85, 247, 0.5)',
        '--color-accent': '#22d3ee', // cyan-400
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#d1d5db',
        '--color-bg-primary': '#000000',
        '--color-bg-secondary': 'rgba(255, 255, 255, 0.1)',
        '--color-border': 'rgba(255, 255, 255, 0.2)',
        '--color-gradient-from': '#000000',
        '--color-gradient-via': '#1e053a',
        '--color-gradient-to': '#2e1065', // violet-950
    },
  },
];