import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SOUNDS = {
  send: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  receive: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
};

export const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Assalamualaykum! I am your Heliotrope Assistant. How can I help you discover artisanal excellence today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sendSound = useRef(new Audio(SOUNDS.send));
  const receiveSound = useRef(new Audio(SOUNDS.receive));

  const playSound = (audio: HTMLAudioElement) => {
    if (soundEnabled) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio blocked:', e));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    // Store history BEFORE adding the new user message to state, 
    // but the API expects the current user message in the contents array.
    const currentHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    playSound(sendSound.current);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...currentHistory,
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "You are the Heliotrope AI Assistant, an expert in Bangladeshi handicrafts and artisanal fashion. You help buyers find products, explain the heritage of items like Jamdani or Nakshi Kantha, and provide styling advice. Be polite, helpful, and maintain a cultural tone. Mention specific Bangladeshi regions noted for certain crafts if relevant.",
        }
      });

      const text = response.text;
      setMessages(prev => [...prev, { role: 'model', text: text || 'I apologize, something went wrong.' }]);
      playSound(receiveSound.current);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Deeply sorry, I am having trouble connecting right now. Please ensure you have configured your Gemini API key.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden backdrop-blur-xl shadow-teal-500/10"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-teal-500/20 to-transparent border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-teal-500/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white leading-none">Assistant</h3>
                <span className="text-[10px] uppercase tracking-widest text-teal-400 font-bold">Online Now</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  soundEnabled ? "text-teal-400 bg-teal-500/10" : "text-gray-500 hover:bg-white/10"
                )}
                title={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'model' ? "bg-teal-500/20 text-teal-400" : "bg-white/10 text-white"
                )}>
                  {msg.role === 'model' ? <Sparkles size={14} /> : <User size={14} />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'model' ? "bg-white/5 text-gray-200 border border-white/5" : "bg-teal-500 text-black font-medium"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex gap-1 items-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-black/40 border-t border-white/10">
            <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-teal-500/50 transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about crafts, styling..."
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 mr-1 text-teal-400 hover:bg-teal-500/20 rounded-xl transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
