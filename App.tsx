
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import JournalView from './components/JournalView';
import ChatbotView from './components/ChatbotView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { JournalEntry } from './types';

type View = 'journal' | 'chatbot';

const JournalIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-pink-400' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const ChatIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-pink-400' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('journal-auth', false);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [activeView, setActiveView] = useState<View>('journal');

  if (!isAuthenticated) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-blue-900/80"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="relative z-10">
                <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
            </div>
        </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient-xy"></div>
        <style>{`
            @keyframes gradient-xy {
                0%, 100% {
                    background-size: 400% 400%;
                    background-position: 0% 50%;
                }
                50% {
                    background-size: 200% 200%;
                    background-position: 100% 50%;
                }
            }
            .animate-gradient-xy {
                animation: gradient-xy 15s ease infinite;
            }
        `}</style>

      <div className="relative z-10 flex h-screen">
        <nav className="w-20 bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 gap-8">
            <button 
                onClick={() => setActiveView('journal')} 
                className="group p-3 rounded-xl transition-colors hover:bg-white/10"
                aria-label="Journal View"
            >
                <JournalIcon isActive={activeView === 'journal'} />
            </button>
            <button 
                onClick={() => setActiveView('chatbot')} 
                className="group p-3 rounded-xl transition-colors hover:bg-white/10"
                aria-label="Chatbot View"
            >
                <ChatIcon isActive={activeView === 'chatbot'} />
            </button>
        </nav>
        <main className="flex-1">
            {activeView === 'journal' && <JournalView entries={journalEntries} setEntries={setJournalEntries} />}
            {activeView === 'chatbot' && <ChatbotView />}
        </main>
      </div>
    </div>
  );
}
