import React from 'react';
import { themes } from '../themes';
import { ThemeName } from '../types';

interface ThemeSwitcherProps {
  currentThemeName: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentThemeName, onThemeChange }) => {
  const handleThemeClick = (themeName: ThemeName) => {
    onThemeChange(themeName);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Select a Theme</h2>
      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => handleThemeClick(theme.name)}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
              currentThemeName === theme.name
                ? 'bg-white/20'
                : 'hover:bg-white/10'
            }`}
          >
            <span className="text-sm font-medium text-white">{theme.name}</span>
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full border-2 border-black/50" style={{ backgroundColor: theme.colors['--color-primary'] }}></div>
              <div className="w-5 h-5 rounded-full border-2 border-black/50" style={{ backgroundColor: theme.colors['--color-secondary'] }}></div>
              <div className="w-5 h-5 rounded-full border-2 border-black/50" style={{ backgroundColor: theme.colors['--color-accent'] }}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;