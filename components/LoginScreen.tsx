
import React, { useState } from 'react';
import { APP_PASSWORD } from '../constants';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white border border-white/20">
          <div className="flex flex-col items-center">
            <LockIcon />
            <h1 className="text-3xl font-bold mb-2 text-center">Your Private Journal</h1>
            <p className="text-cyan-200 mb-8 text-center">Protected for your eyes only.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-black/30 rounded-lg border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Unlock Journal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
