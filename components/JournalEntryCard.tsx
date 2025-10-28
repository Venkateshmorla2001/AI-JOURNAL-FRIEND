import React from 'react';
import { JournalEntry } from '../types';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clipRule="evenodd" />
    </svg>
);

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2 text-[var(--color-accent)] opacity-70" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);


const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
  const { date, content, analysis, image, location } = entry;
  const emotionColor = analysis ? EMOTION_COLORS[analysis.emotion] : 'border-gray-500 bg-gray-500/10';
  const emotionEmoji = analysis ? EMOTION_EMOJIS[analysis.emotion] : '🤔';

  return (
    <div className={`bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-xl p-6 border transition-all duration-300 hover:border-[var(--color-primary-muted)] hover:shadow-[0_0_20px_-5px_var(--color-primary)] ${emotionColor} journal-card-print`}>
      {image && <img src={image} alt="Journal entry" className="w-full h-auto object-cover rounded-lg mb-4" />}
      <div className="flex justify-between items-start mb-4">
        <div className="font-semibold text-lg text-[var(--color-accent)] flex items-center">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {location && (
            <div className="relative group">
              <LocationPinIcon />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            </div>
          )}
        </div>
        {analysis && (
          <div className="text-right">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${emotionColor} border-0`}>
                {emotionEmoji} {analysis.emotion}
            </span>
          </div>
        )}
      </div>
      <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap mb-6">{content}</p>

      {analysis && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <h3 className="text-md font-semibold text-[var(--color-primary)] mb-2 flex items-center"><SparklesIcon /> AI Insights</h3>
          <p className="text-sm text-[var(--color-text-secondary)] italic mb-4">"{analysis.summary}"</p>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-[var(--color-accent)] mr-2">✦</span>
                <span className="text-[var(--color-text-secondary)]">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JournalEntryCard;