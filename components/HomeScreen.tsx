import React, { useState } from 'react';
import { AppSettings } from '../types';

type View = 'home' | 'journal' | 'chatbot' | 'calendar' | 'settings';

interface HomeScreenProps {
  setView: (view: View) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const NavCard = ({ icon, title, description, onClick }: { icon: string; title: string; description: string; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className="bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-xl p-6 border border-[var(--color-border)] text-left transition-all duration-300 hover:border-[var(--color-primary-muted)] hover:shadow-[0_0_20px_-5px_var(--color-primary)] transform hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
    <p className="text-[var(--color-text-secondary)] text-sm">{description}</p>
  </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ setView, settings, setSettings }) => {
  const [nameInput, setNameInput] = useState('');

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setSettings(prev => ({ ...prev, userName: nameInput.trim() }));
      setNameInput('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-4 md:p-8">
      <div className="text-center mb-12">
        {settings.userName ? (
            <>
                <h1 className="text-5xl font-bold text-white">{getGreeting()}, {settings.userName}!</h1>
                <p className="text-lg text-[var(--color-accent)] mt-2">Ready to reflect and connect?</p>
            </>
        ) : (
            <>
                <h1 className="text-5xl font-bold text-white mb-4">{getGreeting()}</h1>
                <form onSubmit={handleNameSave} className="w-full max-w-sm mx-auto">
                <label htmlFor="name-input" className="text-lg text-[var(--color-accent)] mb-2 block">What should I call you?</label>
                <div className="flex gap-2">
                    <input
                    id="name-input"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-2 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-white"
                    />
                    <button type="submit" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Save
                    </button>
                </div>
                </form>
            </>
        )}
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <NavCard
          icon="📖"
          title="My Journal"
          description="Write down your thoughts and get AI-powered insights."
          onClick={() => setView('journal')}
        />
        <NavCard
          icon="💬"
          title="Honest Friend Chat"
          description="Talk with your empathetic AI companion, Honest friend."
          onClick={() => setView('chatbot')}
        />
        <NavCard
          icon="🗓️"
          title="Calendar"
          description="Visualize your journey and label your days."
          onClick={() => setView('calendar')}
        />
        <NavCard
          icon="⚙️"
          title="Settings"
          description="Customize your themes and app experience."
          onClick={() => setView('settings')}
        />
      </div>
    </div>
  );
};

export default HomeScreen;