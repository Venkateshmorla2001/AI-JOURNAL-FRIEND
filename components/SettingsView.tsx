import React from 'react';
import { AppSettings, ThemeName } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  currentThemeName: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, currentThemeName, onThemeChange }) => {
  const toggleMusic = () => {
    setSettings(prev => ({ ...prev, isMusicEnabled: !prev.isMusicEnabled }));
  };

  return (
    <div className="h-full p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-white mb-4">Preferences</h2>
          <div className="flex justify-between items-center">
            <div className="text-white">
              <p className="font-semibold">Relaxing Music</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Play soothing background music.</p>
            </div>
            <button
              onClick={toggleMusic}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.isMusicEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.isMusicEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        
        <div className="bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-xl p-6 border border-[var(--color-border)]">
           <ThemeSwitcher currentThemeName={currentThemeName} onThemeChange={onThemeChange} />
        </div>
      </div>
    </div>
  );
};

export default SettingsView;