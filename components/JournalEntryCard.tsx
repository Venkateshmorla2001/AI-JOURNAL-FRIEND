
import React from 'react';
import { JournalEntry } from '../types';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-pink-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clipRule="evenodd" />
    </svg>
);


const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
  const { date, content, analysis } = entry;
  const emotionColor = analysis ? EMOTION_COLORS[analysis.emotion] : 'border-gray-500 bg-gray-500/10';
  const emotionEmoji = analysis ? EMOTION_EMOJIS[analysis.emotion] : '🤔';

  return (
    <div className={`bg-black/20 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:border-pink-500/80 ${emotionColor}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="font-semibold text-lg text-cyan-300">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {analysis && (
          <div className="text-right">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${emotionColor} border-0`}>
                {emotionEmoji} {analysis.emotion}
            </span>
          </div>
        )}
      </div>
      <p className="text-gray-300 whitespace-pre-wrap mb-6">{content}</p>

      {analysis && (
        <div className="border-t border-white/20 pt-4">
          <h3 className="text-md font-semibold text-pink-400 mb-2 flex items-center"><SparklesIcon /> AI Insights</h3>
          <p className="text-sm text-gray-300 italic mb-4">"{analysis.summary}"</p>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-cyan-400 mr-2">✦</span>
                <span className="text-gray-300">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JournalEntryCard;
