/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Terminal, Cpu, History, Info, MapPin, Coffee } from 'lucide-react';
import { chatWithGemini } from './services/gemini';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsBooting(false), 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const geminiMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await chatWithGemini(geminiMessages);

    const modelMessage: Message = {
      role: 'model',
      content: response || 'ERROR: NO_RESPONSE_RECEIVED',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  if (isBooting) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-k-yellow p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-cream p-12 rounded-[40px] shadow-2xl border-8 border-card-white text-center space-y-6 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-k-red tracking-tighter uppercase">
            ಕನ್ನಡ ಎನ್ವೈ (KANNADA AI)
          </h1>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              className="h-full bg-k-red"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Heritage Protocols... {Math.round(bootProgress)}%
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full h-[90vh] bg-bg-cream rounded-[40px] shadow-2xl border-8 border-card-white overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-k-red from-50% to-k-yellow to-50% h-20 flex items-center px-10 justify-between shrink-0">
        <h1 className="text-white font-bold text-2xl uppercase tracking-widest drop-shadow-md">
          ಕನ್ನಡ ಎನ್ವೈ (KANNADA AI)
        </h1>
        <div className="text-white font-extrabold text-xs tracking-widest hidden sm:block">
          RAJYOTSAVA SPECIAL EDITION
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-card-white border-r-2 border-[#F0EDE0] p-8 hidden md:flex flex-col gap-6 shrink-0">
          <div>
            <div className="heritage-tag">Explore Heritage</div>
            <h2 className="font-serif italic text-2xl text-k-red mb-4">Quick Topics</h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: "🏰", label: "Historical Monuments" },
                { icon: "🍲", label: "Traditional Cuisines" },
                { icon: "✍️", label: "Kannada Literature" },
                { icon: "💃", label: "Folk Art Forms" },
                { icon: "⛰️", label: "Western Ghats" }
              ].map((topic) => (
                <button 
                  key={topic.label}
                  onClick={() => setInput(topic.label)}
                  className="topic-pill"
                >
                  <span className="text-xl">{topic.icon}</span> {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-5 bg-[#FFF5F5] rounded-[20px] border border-k-red/10">
            <div className="heritage-tag !text-k-red">Fact of the Day</div>
            <p className="text-sm leading-relaxed text-text-dark">
              Hampi was the second-largest city in the world during the 15th century.
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col p-8 chat-bg-pattern overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <Info className="w-12 h-12 text-k-red" />
                <p className="font-serif italic text-xl">Namaskara! How can I help you celebrate Karnataka today?</p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest mt-1 opacity-30 px-2">
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-k-red/50 uppercase tracking-widest animate-pulse">
                <Cpu className="w-3 h-3" /> Processing Heritage Data...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="input-bar shrink-0">
            <span className="opacity-30 text-xl">⌨️</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Yakshagana, Mysore Palace, or Bisi Bele Bath..."
              className="flex-1 bg-transparent border-none focus:outline-none text-base placeholder:text-gray-300"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-k-red text-white rounded-full flex items-center justify-center font-bold hover:scale-105 transition-transform disabled:opacity-30"
            >
              →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
