// Fix for SpeechRecognition API not being in standard TS lib
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, Emotion } from '../types';
import { analyzeJournalEntry, generateImageForEntry } from '../services/geminiService';
import JournalEntryCard from './JournalEntryCard';
import LoadingSpinner from './LoadingSpinner';
import EmojiStickerPicker from './EmojiStickerPicker';
import { useDebounce } from '../hooks/useDebounce';

interface JournalViewProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onEmotionDetected: (emotion: Emotion) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const MicIcon = ({ isListening }: { isListening: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4-4a4 4 0 018 0m-4-7a2 2 0 012 2v2a2 2 0 01-2 2" />
    </svg>
);


const JournalView: React.FC<JournalViewProps> = ({ entries, setEntries, selectedDate, setSelectedDate, onEmotionDetected }) => {
  const [currentContent, setCurrentContent] = useState('');
  const [image, setImage] = useState<{ file: File; base64: string; preview: string } | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [locationError, setLocationError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [justTranscribed, setJustTranscribed] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const dateId = formatDate(selectedDate);
  const isToday = formatDate(new Date()) === dateId;
  
  const debouncedContent = useDebounce(currentContent, 1500);
  const debouncedImage = useDebounce(image, 500);
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    const entryForDate = entries.find(e => e.id === dateId);
    if (entryForDate) {
      setCurrentContent(entryForDate.content);
      if (entryForDate.image) {
        const base64 = entryForDate.image.split(',')[1];
        setImage({ file: new File([], ""), base64: base64, preview: entryForDate.image });
      } else {
        setImage(null);
      }
      if (entryForDate.location) {
        setLocation(entryForDate.location);
      } else {
        setLocation(null);
      }
    } else {
      // Reset fields for a new entry on a different date
      setCurrentContent('');
      setImage(null);
      setLocation(null);
    }
  }, [dateId, entries]);

  useEffect(() => {
    autoSaveAndAnalyze();
  }, [debouncedContent, debouncedImage, debouncedLocation]);

  const autoSaveAndAnalyze = async () => {
    if (currentContent.trim() === '' && !image) return;
    setSaveStatus('saving');

    const existingEntryIndex = entries.findIndex(e => e.id === dateId);

    let currentEntryData: Partial<JournalEntry> = {
      content: currentContent,
      image: image?.preview,
      location: location
    };
    
    const hasContentChanged = existingEntryIndex !== -1 ? 
      (entries[existingEntryIndex].content !== currentContent || entries[existingEntryIndex].image !== image?.preview) 
      : true;

    if (hasContentChanged) {
      setIsAnalyzing(true);
      const analysis = await analyzeJournalEntry(currentContent, image?.base64);
      currentEntryData.analysis = analysis;
      if (analysis.emotion) {
        onEmotionDetected(analysis.emotion);
      }
      setIsAnalyzing(false);
    } else if (existingEntryIndex !== -1) {
      currentEntryData.analysis = entries[existingEntryIndex].analysis;
    }

    const newEntry: JournalEntry = {
      id: dateId,
      date: selectedDate.toISOString(),
      ...currentEntryData,
      content: currentContent,
    };
    
    if (existingEntryIndex !== -1) {
      const updatedEntries = [...entries];
      updatedEntries[existingEntryIndex] = { ...updatedEntries[existingEntryIndex], ...newEntry };
      setEntries(updatedEntries);
    } else {
      setEntries(prev => [...prev, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setImage({ file, base64, preview: URL.createObjectURL(file) });
    }
  };
  
  const handleGetLocation = () => {
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setLocationError('Unable to retrieve location. Please enable permissions.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        setCurrentContent(newText);
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(start + emoji.length, start + emoji.length), 0);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported by your browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
            const newTranscript = lastResult[0].transcript.trim();
            if (newTranscript) {
                setCurrentContent(prev => (prev ? prev.trim() + ' ' : '') + newTranscript);
                setJustTranscribed(true);
                setTimeout(() => setJustTranscribed(false), 500);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };
    
    recognition.start();
    setIsListening(true);
  };
  
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <span className="text-xs text-[var(--color-accent)]">Saving...</span>;
      case 'saved':
        return <span className="text-xs text-green-400">Saved!</span>;
      default:
        return isAnalyzing ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-xs text-[var(--color-accent)]">Analyzing...</span>
          </div>
        ) : <div className="h-4"></div>; // Placeholder for height
    }
  };

  const handleExport = () => {
    window.print();
  };
  
  const handleGenerateImage = async () => {
    if (!currentContent.trim()) {
        alert("Please write something in your journal before generating an image.");
        return;
    }
    setIsGeneratingImage(true);
    const generatedBase64 = await generateImageForEntry(currentContent);
    if (generatedBase64) {
        const dataUrl = `data:image/jpeg;base64,${generatedBase64}`;
        setImage({
            file: new File([], "generated.jpg"),
            base64: generatedBase64,
            preview: dataUrl,
        });
    } else {
        alert("Sorry, I couldn't generate an image for that entry. Please try again.");
    }
    setIsGeneratingImage(false);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-6">
      <div className="bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-xl p-6 border border-[var(--color-border)] no-print">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {isToday ? "What's on your mind today?" : `Journal for ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </h2>
          {!isToday && (
            <button onClick={() => setSelectedDate(new Date())} className="text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors">Go to Today</button>
          )}
        </div>
        {image && (
          <div className="mb-4 relative">
            <img src={image.preview} alt="Preview" className="w-full h-auto max-h-48 object-cover rounded-lg" />
            <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 leading-none text-xl w-7 h-7 flex items-center justify-center">&times;</button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={currentContent}
          onChange={(e) => setCurrentContent(e.target.value)}
          placeholder={isListening ? "Listening... your words will appear here." : "Start writing or tap the mic to speak..."}
          className={`w-full h-40 p-4 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none transition-all text-[var(--color-text-primary)] resize-none ${isListening ? 'ring-2 ring-red-500/70' : 'focus:ring-2 focus:ring-[var(--color-primary)]'} ${justTranscribed ? 'animate-flash' : ''}`}
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2 relative">
             <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors" title="Add Image">📷</button>
             <button onClick={handleGetLocation} className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors" title="Add Location">{location ? '📍' : '🌐'}</button>
             <button onClick={() => setEmojiPickerOpen(p => !p)} className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors" title="Add Emoji">😊</button>
             <button 
                onClick={handleToggleListening} 
                className={`p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/20' : 'hover:bg-white/10'}`} 
                title={isListening ? "Stop recording" : "Start voice typing"}>
                    <MicIcon isListening={isListening} />
             </button>
             <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors flex items-center disabled:opacity-50 disabled:cursor-wait"
                title="Generate Image with AI"
             >
                {isGeneratingImage ? <LoadingSpinner size="sm" /> : '🎨'}
             </button>
             {isEmojiPickerOpen && <EmojiStickerPicker onSelect={handleEmojiSelect} onClose={() => setEmojiPickerOpen(false)} />}
          </div>
          <div className="text-sm text-gray-400">
            {renderSaveStatus()}
          </div>
        </div>
        {locationError && <p className="text-red-400 text-xs mt-2">{locationError}</p>}
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 printable-area">
        <div className="flex justify-between items-center mb-4 px-2 no-print">
            <h3 className="text-xl font-bold text-white">Past Entries</h3>
            <button
                onClick={handleExport}
                className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export to PDF
            </button>
        </div>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 no-print">
            <p className="text-gray-400">Your journal is empty. Write your first entry above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;