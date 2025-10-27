
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getChatInstance } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Chat } from '@google/genai';

const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5H6a1 1 0 001-1V3.5z" />
        </svg>
    </div>
);


const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I\'m Aura, your personal AI companion. How are you feeling today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = getChatInstance();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = await chatRef.current.sendMessageStream({ message: input });
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting right now. Please try again in a moment." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
            <div className="space-y-6">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <BotIcon />}
                <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white/20 text-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <BotIcon />
                    <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-white/20 text-gray-200 rounded-bl-none">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        </div>

        <div className="mt-auto">
            <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your message to Aura..."
                className="w-full bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                disabled={isLoading}
            />
            <button
                onClick={handleSendMessage}
                disabled={isLoading || input.trim() === ''}
                className="bg-pink-600 hover:bg-pink-500 text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
            </div>
        </div>
    </div>
  );
};

export default ChatbotView;
