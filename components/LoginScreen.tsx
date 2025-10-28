
import React, { useState, useMemo } from 'react';
import { AuthState } from '../types';
import { POSITIVE_QUOTES } from '../constants';

// FIX: Added JSX type definition for model-viewer to resolve compilation error.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface AuthScreenProps {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  onAuthSuccess: () => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[var(--color-accent)] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ authState, setAuthState, onAuthSuccess }) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const getInitialView = () => {
    if (authState.protection === 'unset') return 'welcome';
    if (authState.protection === 'enabled') return 'login';
    return 'welcome';
  };
  const [view, setView] = useState(getInitialView);

  const quote = useMemo(() => POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)], []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '') {
      setError('Password field cannot be empty.');
      return;
    }
    if (password === authState.password) {
      if (rememberMe) {
        setAuthState(prev => ({ ...prev, rememberMe: true }));
      }
      onAuthSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };
  
  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim() === '') {
        setError('Password cannot be empty.');
        return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    setAuthState({ protection: 'enabled', password: newPassword });
    onAuthSuccess();
  };

  const handleNoPassword = () => {
    setAuthState({ protection: 'disabled' });
    onAuthSuccess();
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return (
          <>
            <div className="flex flex-col items-center">
              <LockIcon />
              <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
              <p className="text-[var(--color-accent)] opacity-80 mb-8 text-center">Your journal is waiting.</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
               <div className="mb-6 flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-transparent"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-[var(--color-text-secondary)]">
                  Remember Me
                </label>
              </div>
              {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
              <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:brightness-110">
                Unlock Journal
              </button>
            </form>
          </>
        );
      case 'setPassword':
        return (
          <>
            <div className="flex flex-col items-center">
              <LockIcon />
              <h1 className="text-3xl font-bold mb-2 text-center">Create a Password</h1>
              <p className="text-[var(--color-accent)] opacity-80 mb-8 text-center">Secure your thoughts and memories.</p>
            </div>
            <form onSubmit={handleSetPassword}>
              <div className="mb-4">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Choose a password"
                  className="w-full px-4 py-3 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
              <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:brightness-110">
                Save & Enter
              </button>
            </form>
          </>
        );
      case 'welcome':
      default:
        return (
          <>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold mb-3">Welcome to Your Space</h1>
              <p className="text-[var(--color-accent)] opacity-90 mb-8 text-lg">{quote}</p>
              <div className="w-full space-y-4">
                 <button onClick={() => setView('setPassword')} className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:brightness-110">
                    Secure My Journal
                 </button>
                 <button onClick={handleNoPassword} className="w-full bg-transparent border border-[var(--color-secondary-muted)] text-white font-medium py-3 px-4 rounded-lg transition-colors hover:bg-white/10">
                    Continue without Password
                 </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full transition-all duration-500 ${view === 'login' ? 'max-w-4xl' : 'max-w-md'}`}>
        <div className={`bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-2xl shadow-2xl text-white border border-[var(--color-border)] ${view === 'login' ? 'md:flex' : ''}`}>
          {view === 'login' && (
            <div className="flex flex-1 flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[var(--color-border)]">
              <model-viewer
                  src="https://cdn.glitch.global/6a56f40a-513c-42b7-9a5c-7557d383842c/a-beautiful-anime-girl.glb?v=1644788876882"
                  alt="AI Assistant"
                  animation-name="Wave"
                  camera-controls
                  disable-zoom
                  style={{width: '100%', height: '250px', backgroundColor: 'transparent'}}
              ></model-viewer>
              <div className="relative mt-4 bg-black/30 p-3 rounded-lg border border-[var(--color-secondary-muted)]">
                  <p className="text-sm text-center">Welcome back!~ ☆ I've been waiting for you! Your secrets are safe with me. Let's get you logged in!</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/50"></div>
              </div>
            </div>
          )}
          <div className={`p-8 ${view === 'login' ? 'w-full md:w-1/2' : 'w-full'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
