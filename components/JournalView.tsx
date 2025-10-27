
import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { analyzeJournalEntry } from '../services/geminiService';
import JournalEntryCard from './JournalEntryCard';
import LoadingSpinner from './LoadingSpinner';

interface JournalViewProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
}

const JournalView: React.FC<JournalViewProps> = ({ entries, setEntries }) => {
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEntry = async () => {
    if (newEntry.trim() === '') return;
    setIsLoading(true);

    const analysis = await analyzeJournalEntry(newEntry);

    const entry: JournalEntry = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      content: newEntry,
      analysis,
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">What's on your mind today?</h2>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Start writing here..."
          className="w-full h-40 p-4 bg-black/30 rounded-lg border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white resize-none"
          disabled={isLoading}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveEntry}
            disabled={isLoading || newEntry.trim() === ''}
            className="flex items-center justify-center bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Save & Analyze'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="text-xl font-bold text-white mb-4 px-2">Past Entries</h3>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">Your journal is empty. Write your first entry above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;
