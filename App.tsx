import React, { useState, useEffect, useRef } from 'react';
import AuthScreen from './components/LoginScreen';
import JournalView from './components/JournalView';
import ChatbotView from './components/ChatbotView';
import HomeScreen from './components/HomeScreen';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { JournalEntry, ThemeName, AuthState, AppSettings, CalendarData } from './types';
import { themes } from './themes';

type View = 'home' | 'journal' | 'chatbot' | 'calendar' | 'settings';

const HomeIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const JournalIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const ChatIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const CalendarIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const SettingsIcon = ({isActive}: {isActive: boolean}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default function App() {
  const [authState, setAuthState] = useLocalStorage<AuthState>('journal-auth-state', { protection: 'unset' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [calendarData, setCalendarData] = useLocalStorage<CalendarData>('journal-calendar-data', {});
  const [settings, setSettings] = useLocalStorage<AppSettings>('journal-settings', { isMusicEnabled: false });
  const [activeView, setActiveView] = useState<View>('home');
  const [currentThemeName, setCurrentThemeName] = useLocalStorage<ThemeName>('journal-theme', 'Twilight Nebula');
  const [selectedJournalDate, setSelectedJournalDate] = useState(new Date());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (authState.protection === 'disabled' || (authState.protection === 'enabled' && authState.rememberMe)) {
      setIsAuthenticated(true);
    }
  }, [authState]);
  
  useEffect(() => {
    audioRef.current = document.getElementById('ambient-music') as HTMLAudioElement;
  }, []);

  useEffect(() => {
    const theme = themes.find(t => t.name === currentThemeName) || themes[0];
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentThemeName]);
  
  useEffect(() => {
    if (audioRef.current) {
        if (settings.isMusicEnabled && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else if (!settings.isMusicEnabled && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }
  }, [settings.isMusicEnabled, isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if(settings.isMusicEnabled && audioRef.current?.paused) {
        audioRef.current?.play().catch(e => console.error("Audio play failed on login:", e));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if(authState.protection === 'enabled') {
        setAuthState(prev => ({ ...prev, rememberMe: false }));
    }
  };

  const backgroundStyle = {
    background: `linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-via), var(--color-gradient-to))`
  };

  if (!isAuthenticated) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[var(--color-bg-primary)]">
            <div className="absolute inset-0 opacity-80" style={backgroundStyle}></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="relative z-10">
                <AuthScreen 
                  authState={authState} 
                  setAuthState={setAuthState} 
                  onAuthSuccess={handleLoginSuccess} 
                />
            </div>
        </div>
    );
  }

  const renderView = () => {
    switch(activeView) {
        case 'journal':
            return <JournalView entries={journalEntries} setEntries={setJournalEntries} selectedDate={selectedJournalDate} setSelectedDate={setSelectedJournalDate} />;
        case 'chatbot':
            return <ChatbotView settings={settings} />;
        case 'calendar':
            return <CalendarView 
                        entries={journalEntries} 
                        calendarData={calendarData} 
                        setCalendarData={setCalendarData}
                        onDateSelectForJournal={(date) => {
                            setSelectedJournalDate(date);
                            setActiveView('journal');
                        }}
                    />;
        case 'settings':
            return <SettingsView 
                        settings={settings} 
                        setSettings={setSettings} 
                        currentThemeName={currentThemeName} 
                        onThemeChange={setCurrentThemeName} 
                        authState={authState}
                        setAuthState={setAuthState}
                    />;
        case 'home':
        default:
            return <HomeScreen setView={setActiveView} settings={settings} setSettings={setSettings} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="absolute inset-0 animate-gradient-xy" style={backgroundStyle}></div>
        <style>{`
            @keyframes gradient-xy {
                0%, 100% { background-size: 400% 400%; background-position: 0% 50%; }
                50% { background-size: 200% 200%; background-position: 100% 50%; }
            }
            .animate-gradient-xy { animation: gradient-xy 15s ease infinite; }
        `}</style>
      <div className="relative z-10 flex h-screen">
        <nav className="w-20 bg-black/30 backdrop-blur-xl border-r border-[var(--color-border)] flex flex-col items-center py-6 gap-6 no-print">
            <button onClick={() => setActiveView('home')} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Home"><HomeIcon isActive={activeView === 'home'} /></button>
            <button onClick={() => { setSelectedJournalDate(new Date()); setActiveView('journal'); }} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Journal View"><JournalIcon isActive={activeView === 'journal'} /></button>
            <button onClick={() => setActiveView('chatbot')} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Chatbot View"><ChatIcon isActive={activeView === 'chatbot'} /></button>
            <button onClick={() => setActiveView('calendar')} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Calendar View"><CalendarIcon isActive={activeView === 'calendar'} /></button>
            <div className="mt-auto flex flex-col gap-4 items-center">
                 <button onClick={() => setActiveView('settings')} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Settings"><SettingsIcon isActive={activeView === 'settings'} /></button>
                {authState.protection === 'enabled' && (
                    <button onClick={handleLogout} className="group p-3 rounded-xl transition-colors hover:bg-white/10" aria-label="Logout"><LogoutIcon /></button>
                )}
            </div>
        </nav>
        <main className="flex-1 relative">
            {renderView()}
        </main>
      </div>
    </div>
  );
}