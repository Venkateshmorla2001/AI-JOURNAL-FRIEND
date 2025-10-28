
// Fix for webkitAudioContext not being in standard TS lib
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
    // FIX: Added JSX type definition for model-viewer to resolve compilation error.
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatHistory, AppSettings } from '../types';
import { getChatResponse, getComplexChatResponse, getGroundedChatResponse } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';

const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5-1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5H6a1 1 0 001-1V3.5z" />
        </svg>
    </div>
);

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

interface ChatbotViewProps {
  settings: AppSettings;
}

const ChatbotView: React.FC<ChatbotViewProps> = ({ settings }) => {
  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistory>('journal-chat-history', {});
  const [isIncognito, setIsIncognito] = useLocalStorage('journal-chat-incognito', false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isDeepThought, setIsDeepThought] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());
  const modelViewerRef = useRef<any>(null);

  // Live session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const historyForDate = chatHistory[dateKey] || [];
    setCurrentMessages(historyForDate);
  }, [selectedDate, chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading, currentInputTranscription, currentOutputTranscription]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // Wave once on load
      modelViewer.animationName = 'Wave';
      modelViewer.play({repetitions: 1});
    }
  }, []);
  
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    // Check if model has finished loading and we are not in an initial loading state
    if (modelViewer?.model && !isLoading && currentMessages.length > 0 && currentMessages[currentMessages.length - 1].role === 'model') {
      modelViewer.animationName = 'ThumbsUp';
      modelViewer.play({ repetitions: 1 }).then(() => {
        modelViewer.animationName = 'Idle';
      });
    }
  }, [isLoading, currentMessages]);
  
  const cleanupAudio = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;

    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;
  }, []);

  const stopSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session", e);
      } finally {
        sessionPromiseRef.current = null;
        cleanupAudio();
        setIsSessionActive(false);
        setIsConnecting(false);
      }
    }
  }, [cleanupAudio]);

  const startSession = async () => {
    if (isSessionActive || isConnecting) return;

    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        alert("Microphone access is required for voice chat. Please enable permissions and try again.");
        return;
    }
    
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    nextStartTimeRef.current = 0;
    
    sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: `You are a highly empathetic and supportive AI companion. Your name is Honest friend. The user's name is ${settings.userName || 'friend'}. Your purpose is to listen to the user, understand their feelings, and offer kind, insightful, and constructive advice. Avoid being clinical; be warm and conversational. Use emojis to convey tone where appropriate. Keep your responses concise but meaningful. Address the user by their name occasionally.`,
        },
        callbacks: {
            onopen: async () => {
                setIsConnecting(false);
                setIsSessionActive(true);
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                
                scriptProcessorRef.current.onaudioprocess = (event) => {
                    if (sessionPromiseRef.current) {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    }
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    setCurrentInputTranscription(prev => prev + message.serverContent.inputTranscription.text);
                }
                if (message.serverContent?.outputTranscription) {
                    setCurrentOutputTranscription(prev => prev + message.serverContent.outputTranscription.text);
                }

                if (message.serverContent?.turnComplete) {
                    const userInput = currentInputTranscription;
                    const modelOutput = currentOutputTranscription;
                    const newMessages: ChatMessage[] = [];
                    if (userInput) newMessages.push({ role: 'user', text: userInput });
                    if (modelOutput) newMessages.push({ role: 'model', text: modelOutput });

                    setCurrentMessages(prev => [...prev, ...newMessages]);
                    
                    if (!isIncognito && newMessages.length > 0) {
                        const dateKey = formatDateKey(new Date());
                        setChatHistory(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), ...newMessages] }));
                    }
                    setCurrentInputTranscription('');
                    setCurrentOutputTranscription('');
                }

                const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (audioData && outputAudioContextRef.current) {
                    const audioContext = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.addEventListener('ended', () => outputSourcesRef.current.delete(source));
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    outputSourcesRef.current.add(source);
                }

                if (message.serverContent?.interrupted) {
                    outputSourcesRef.current.forEach(source => source.stop());
                    outputSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            onclose: () => { stopSession(); },
            onerror: (e: ErrorEvent) => {
                console.error("Session error:", e);
                stopSession();
            },
        },
    });
  };

  useEffect(() => {
    return () => { stopSession(); }
  }, [stopSession]);
  
    const handleSendTextMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !textInput.trim()) return;

        const newUserMessage: ChatMessage = { role: 'user', text: textInput.trim() };
        setCurrentMessages(prev => [...prev, newUserMessage]);
        setTextInput('');
        setIsLoading(true);

        const history = [...currentMessages, newUserMessage];
        let response: { text: string; sources?: any[] };

        if (isWebSearch) {
            response = await getGroundedChatResponse(currentMessages, newUserMessage.text, settings.userName);
        } else if (isDeepThought) {
            const modelText = await getComplexChatResponse(currentMessages, newUserMessage.text, settings.userName);
            response = { text: modelText };
        } else {
            const modelText = await getChatResponse(currentMessages, newUserMessage.text, settings.userName);
            response = { text: modelText };
        }

        const newModelMessage: ChatMessage = { role: 'model', text: response.text, sources: response.sources };
        
        if (!isIncognito) {
            const dateKey = formatDateKey(new Date());
            setChatHistory(prev => {
                const updatedHistory = [...(prev[dateKey] || []), newUserMessage, newModelMessage];
                return { ...prev, [dateKey]: updatedHistory };
            });
        }
        // This will update state for both incognito and regular mode
        setCurrentMessages(prev => [...prev, newModelMessage]);
        setIsLoading(false);
    };

  const changeDate = (offset: number) => {
    if (isSessionActive) stopSession();
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-4 md:p-6 gap-6">
      {/* Character Pane */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3 bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-xl p-4 md:p-6 border border-[var(--color-border)]">
        <h2 className="text-xl font-bold mb-2 md:mb-4">Honest Friend</h2>
        <model-viewer
            ref={modelViewerRef}
            src="https://cdn.glitch.global/6a56f40a-513c-42b7-9a5c-7557d383842c/a-beautiful-anime-girl.glb?v=1644788876882"
            alt="AI Assistant"
            animation-name="Idle"
            camera-controls
            disable-zoom
            style={{width: '100%', height: '200px', backgroundColor: 'transparent'}}
        ></model-viewer>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2 md:mt-4">
            I'm here to listen and help. What's on your mind, {settings.userName || 'friend'}?
        </p>
      </div>

      {/* Chat Pane */}
      <div className="flex-1 flex flex-col h-full">
          <div className="bg-[var(--color-bg-secondary)] backdrop-blur-lg rounded-xl p-3 mb-4 border border-[var(--color-border)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="incognito-toggle" className="text-sm font-medium cursor-pointer">Incognito</label>
              <button
                id="incognito-toggle"
                onClick={() => setIsIncognito(!isIncognito)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isIncognito ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isIncognito ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">&lt;</button>
              <span className="font-semibold text-lg">{isToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <button onClick={() => changeDate(1)} disabled={isToday} className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">&gt;</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            <div className="space-y-6">
              {currentMessages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <BotIcon />}
                  <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-br-none' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 border-t border-[var(--color-border)] pt-2">
                            <h4 className="text-xs font-semibold mb-1 text-[var(--color-text-primary)]">Sources:</h4>
                            <ul className="space-y-1">
                                {msg.sources.map((source, i) => (
                                    <li key={i} className="text-xs truncate">
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <BotIcon />
                  <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-bl-none">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              {currentInputTranscription && (
                <div className="flex items-start gap-3 justify-end opacity-70">
                    <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-br-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentInputTranscription}</p>
                    </div>
                </div>
              )}
              {currentOutputTranscription && (
                  <div className="flex items-start gap-3 opacity-70">
                      <BotIcon />
                      <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-bl-none">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentOutputTranscription}</p>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="mt-auto">
            {isToday ? (
                <>
                    <div className="text-center">
                        <button 
                            onClick={() => isSessionActive || isConnecting ? stopSession() : startSession()}
                            className={`relative w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center mx-auto disabled:opacity-50 ${isSessionActive ? 'bg-red-500/50' : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]'}`}
                            disabled={isConnecting || !!textInput}
                        >
                            {isConnecting ? <LoadingSpinner /> : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4-4a4 4 0 018 0" />
                                </svg>
                            )}
                            {isSessionActive && <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] animate-pulse"></div>}
                        </button>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 h-4">
                            {isConnecting ? 'Connecting...' : (isSessionActive ? 'Tap to end conversation' : 'Tap to talk with Honest friend')}
                        </p>
                    </div>
                    <div className="relative flex items-center justify-center my-4">
                        <div className="flex-grow border-t border-[var(--color-border)]"></div>
                        <span className="flex-shrink mx-4 text-xs text-[var(--color-text-secondary)]">OR</span>
                        <div className="flex-grow border-t border-[var(--color-border)]"></div>
                    </div>
                    <div>
                        <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={isDeepThought ? "Ask a complex question..." : (isWebSearch ? "Search the web..." : "Type a message...")}
                                className="flex-1 px-4 py-3 bg-black/30 rounded-lg border border-[var(--color-secondary-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-white disabled:opacity-50"
                                disabled={isLoading || isSessionActive}
                            />
                            <button type="submit" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || isSessionActive || !textInput.trim()}>
                                {isLoading ? <LoadingSpinner size="sm" /> : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                )}
                            </button>
                        </form>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium cursor-pointer">Web Search</label>
                                <button onClick={() => { setIsWebSearch(!isWebSearch); if(!isWebSearch) setIsDeepThought(false); }} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isWebSearch ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}>
                                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isWebSearch ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium cursor-pointer">Deep Thought</label>
                                <button onClick={() => { setIsDeepThought(!isDeepThought); if(!isDeepThought) setIsWebSearch(false); }} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDeepThought ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}>
                                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDeepThought ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-secondary)] py-3 px-4 rounded-lg text-center">
                    Voice and text chat is only available for today's conversation.
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default ChatbotView;
