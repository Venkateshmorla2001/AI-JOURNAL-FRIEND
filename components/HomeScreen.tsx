import React from 'react';

type View = 'home' | 'journal' | 'chatbot' | 'calendar' | 'settings';

interface HomeScreenProps {
  setView: (view: View) => void;
}

const NavCard = ({ icon, title, description, onClick }: { icon: string; title: string; description: string; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-[var(--color-border)] text-left transition-all duration-300 hover:border-[var(--color-primary-muted)] hover:bg-white/10 transform hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
    <p className="text-[var(--color-text-secondary)] text-sm">{description}</p>
  </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ setView }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white">{getGreeting()}</h1>
        <p className="text-lg text-[var(--color-accent)] mt-2">Ready to reflect and connect?</p>
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
          title="Aura Chat"
          description="Talk with your empathetic AI companion, Aura."
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