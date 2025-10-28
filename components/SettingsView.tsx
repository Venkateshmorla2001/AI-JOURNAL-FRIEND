import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { AppSettings, ThemeName, AuthState } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  currentThemeName: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, currentThemeName, onThemeChange, authState, setAuthState }) => {
  const [passwordAction, setPasswordAction] = useState<'change' | 'disable' | 'enable' | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  
  const toggleMusic = () => {
    setSettings(prev => ({ ...prev, isMusicEnabled: !prev.isMusicEnabled }));
  };

  const resetModalState = () => {
    setPasswordAction(null);
    setCurrentPassword('');
    setNewPassword('');
    setError('');
  };

  const handleSubmitPasswordAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordAction === 'change') {
      if (currentPassword !== authState.password) {
        setError('Incorrect current password.');
        return;
      }
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters long.');
        return;
      }
      setAuthState(prev => ({ ...prev, password: newPassword }));
      alert('Password changed successfully!');
      resetModalState();
    } else if (passwordAction === 'disable') {
      if (currentPassword !== authState.password) {
        setError('Incorrect password.');
        return;
      }
      setAuthState({ protection: 'disabled', password: '' });
      alert('Password protection disabled.');
      resetModalState();
    } else if (passwordAction === 'enable') {
      if (newPassword.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
      setAuthState({ protection: 'enabled', password: newPassword, rememberMe: false });
      alert('Password protection enabled.');
      resetModalState();
    }
  };

  const renderPasswordModal = () => {
    if (!passwordAction) return null;

    const titles = {
      change: 'Change Password',
      disable: 'Disable Password Protection',
      enable: 'Enable Password Protection',
    };
    const buttonText = {
        change: 'Save Changes',
        disable: 'Confirm Disable',
        enable: 'Enable & Save',
    };

    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetModalState}>
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">{titles[passwordAction]}</h2>
          <form onSubmit={handleSubmitPasswordAction} className="space-y-4">
            {(passwordAction === 'change' || passwordAction === 'disable') && (
              <div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-3 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            )}
            {(passwordAction === 'change' || passwordAction === 'enable') && (
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 4 chars)"
                  required
                  minLength={4}
                  className="w-full px-4 py-3 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={resetModalState} className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
              <button type="submit" className="text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold px-4 py-2 rounded-lg shadow-lg">{buttonText[passwordAction]}</button>
            </div>
          </form>
        </div>
      </div>,
      document.getElementById('modal-root')!
    );
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
          <h2 className="text-xl font-bold text-white mb-4">Security</h2>
          {authState.protection === 'enabled' ? (
            <div className="space-y-3">
              <p className="text-[var(--color-text-secondary)]">Password protection is enabled.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setPasswordAction('change')} className="w-full text-center text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">Change Password</button>
                <button onClick={() => setPasswordAction('disable')} className="w-full text-center text-sm bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/40 transition-colors">Disable Protection</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[var(--color-text-secondary)]">Password protection is disabled.</p>
              <button onClick={() => setPasswordAction('enable')} className="w-full text-center text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold px-4 py-2 rounded-lg shadow-lg">Enable Password Protection</button>
            </div>
          )}
        </div>

        <div className="bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-xl p-6 border border-[var(--color-border)]">
           <ThemeSwitcher currentThemeName={currentThemeName} onThemeChange={onThemeChange} />
        </div>
      </div>
      {renderPasswordModal()}
    </div>
  );
};

export default SettingsView;