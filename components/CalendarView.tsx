import React, { useState, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { JournalEntry, CalendarData, CalendarLabel } from '../types';
import { EMOJIS, STICKERS } from '../constants';
import JournalEntryCard from './JournalEntryCard';

interface CalendarViewProps {
  entries: JournalEntry[];
  calendarData: CalendarData;
  setCalendarData: React.Dispatch<React.SetStateAction<CalendarData>>;
  onDateSelectForJournal: (date: Date) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      // Return only the base64 part
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
};

const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

// Label Editor Modal Component
const LabelEditorModal = ({ date, existingLabel, onSave, onClose }: { date: Date, existingLabel?: CalendarLabel, onSave: (label: CalendarLabel | null) => void, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | 'image'>('emoji');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setImagePreview(URL.createObjectURL(file));
            onSave({ type: 'image', value: `data:image/jpeg;base64,${base64}` });
        }
    };
    
    const handleRemoveLabel = () => {
        onSave(null);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--color-bg-secondary)] backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Label for {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h2>
                <div className="flex border-b border-[var(--color-border)] mb-4">
                    <button onClick={() => setActiveTab('emoji')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'emoji' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400'}`}>Emoji</button>
                    <button onClick={() => setActiveTab('sticker')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'sticker' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400'}`}>Sticker</button>
                    <button onClick={() => setActiveTab('image')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'image' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-400'}`}>Image</button>
                </div>
                <div className="h-64 overflow-y-auto">
                    {activeTab === 'emoji' && (
                        <div className="grid grid-cols-6 gap-2">
                            {EMOJIS.map(emoji => <button key={emoji} onClick={() => onSave({type: 'emoji', value: emoji})} className="text-3xl p-2 rounded-lg hover:bg-white/10 transition-colors">{emoji}</button>)}
                        </div>
                    )}
                    {activeTab === 'sticker' && (
                         <div className="grid grid-cols-3 gap-2 text-center">
                            {STICKERS.map(sticker => <button key={sticker.name} onClick={() => onSave({type: 'sticker', value: sticker.emoji})} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><div className="text-3xl">{sticker.emoji}</div><div className="text-xs">{sticker.name}</div></button>)}
                        </div>
                    )}
                    {activeTab === 'image' && (
                        <div className="text-center">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 py-3 rounded-lg hover:bg-white/20">Upload Image</button>
                            {imagePreview && <img src={imagePreview} className="mt-4 rounded-lg" alt="Preview" />}
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-between">
                    <button onClick={handleRemoveLabel} className="text-sm bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/40 transition-colors">Remove Label</button>
                    <button onClick={onClose} className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">Close</button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ entries, calendarData, setCalendarData, onDateSelectForJournal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                week.push(null);
            } else if (day > daysInMonth) {
                week.push(null);
            } else {
                week.push(new Date(year, month, day));
                day++;
            }
        }
        grid.push(week);
        if (day > daysInMonth) break;
    }
    return grid;
  }, [month, year]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const handleSaveLabel = (label: CalendarLabel | null) => {
      if(selectedDate) {
          const key = formatDateKey(selectedDate);
          setCalendarData(prev => {
              const newData = {...prev};
              if (label) {
                  newData[key] = label;
              } else {
                  delete newData[key];
              }
              return newData;
          });
      }
      setSelectedDate(null);
  };
  
  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    const dayKey = formatDateKey(date);
    const entry = entries.find(e => e.id === dayKey);
    const label = calendarData[dayKey];
    if (entry) {
        setViewingEntry(entry);
    } else if (label) {
        setSelectedDate(date);
    } else {
        onDateSelectForJournal(date);
    }
  };
  
  const handleEditLabelForEntry = () => {
    if (viewingEntry) {
        const entryDate = new Date(viewingEntry.date);
        setSelectedDate(entryDate);
        setViewingEntry(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-6">
        {selectedDate && <LabelEditorModal date={selectedDate} existingLabel={calendarData[formatDateKey(selectedDate)]} onSave={handleSaveLabel} onClose={() => setSelectedDate(null)} />}
        {viewingEntry && ReactDOM.createPortal(
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingEntry(null)}>
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="bg-[var(--color-bg-secondary)] backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl p-4">
                        <JournalEntryCard entry={viewingEntry} />
                        <div className="mt-4 flex justify-end gap-4">
                            <button onClick={handleEditLabelForEntry} className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                                Edit Label
                            </button>
                            <button onClick={() => setViewingEntry(null)} className="text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.getElementById('modal-root')!
        )}
      <div className="bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-xl p-6 border border-[var(--color-border)]">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">&lt;</button>
            <h2 className="text-2xl font-bold text-white">{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">&gt;</button>
        </div>
        <div className="grid grid-cols-7 text-center font-semibold text-[var(--color-accent)] mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {calendarGrid.flat().map((date, index) => {
                const dayKey = date ? formatDateKey(date) : '';
                const entry = date ? entries.find(e => e.id === dayKey) : null;
                const label = date ? calendarData[dayKey] : null;
                const isToday = date ? dayKey === formatDateKey(new Date()) : false;
                
                return (
                    <div 
                        key={date?.toString() ?? `empty-${index}`} 
                        onClick={() => handleDayClick(date)}
                        className={`h-24 rounded-lg flex flex-col justify-start items-start p-1.5 transition-colors cursor-pointer relative ${date ? 'bg-black/20 hover:bg-white/10' : 'bg-transparent'}`}
                    >
                        {date && <>
                            <span className={`text-sm font-semibold ${isToday ? 'bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center w-6 h-6' : ''}`}>{date.getDate()}</span>
                            {entry && <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" title="Journal entry exists"></div>}
                            {label && <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                {label.type === 'image' ? 
                                    <img src={label.value} className="w-full h-full object-cover rounded-md" alt="Calendar Label" /> 
                                    :
                                    <span className={'opacity-70'}>{label.value}</span>}
                            </div>}
                        </>}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;