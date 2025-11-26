
import React, { useState, useRef, useEffect } from 'react';
import { Send, Info, X, HelpCircle, User, Sparkles, Loader2, BrainCircuit, ListTodo, Coffee, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";

interface AIChatProps {
    userProfile: UserProfile | null;
    onOpenMenu: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const SUGGESTIONS = [
  { label: "Beat Procrastination", icon: Zap, prompt: "I'm feeling stuck and procrastinating. Can you help me get into the zone?" },
  { label: "Break it Down", icon: ListTodo, prompt: "I have a big task and I'm overwhelmed. Can you help me break it into smaller steps?" },
  { label: "Quick Refocus", icon: BrainCircuit, prompt: "I keep getting distracted. Give me a quick strategy to focus." },
];

const AIChat: React.FC<AIChatProps> = ({ userProfile, onOpenMenu }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Hey ${userProfile?.name?.split(' ')[0] || 'there'}! I'm FocusBuddy. Ready to get things done?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Gemini Chat
  useEffect(() => {
    if (!chatSessionRef.current && process.env.API_KEY) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are FocusBuddy, an intelligent and empathetic productivity coach. 
                    Your goal is to help ${userProfile?.name || 'the user'} (${userProfile?.role || 'user'}) stay focused, organize tasks, and maintain a healthy work-life balance. 
                    Keep your responses concise (under 3 paragraphs unless asked for detail), encouraging, and actionable. 
                    Use formatting like bullet points to make things easy to read. 
                    If the user is distracted, gently guide them back with tough love or kindness depending on the context.`,
                },
            });
        } catch (e) {
            console.error("Error initializing AI", e);
        }
    }
  }, [userProfile]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    // Optimistic UI update
    const userMsg: Message = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        if (!chatSessionRef.current) {
             // Fallback if API key is missing
             await new Promise(r => setTimeout(r, 1000));
             const fallbackMsg: Message = { 
                 id: Date.now() + 1, 
                 text: "I'm unable to connect to my brain right now (API Key missing). Please check your configuration.", 
                 sender: 'bot' 
             };
             setMessages(prev => [...prev, fallbackMsg]);
             setIsLoading(false);
             return;
        }

        const result = await chatSessionRef.current.sendMessageStream({ message: textToSend });
        
        const botMsgId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMsgId, text: '', sender: 'bot' }]);

        let fullText = '';
        for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
                fullText += text;
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
            }
        }

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having a bit of trouble connecting. Try again in a moment.", sender: 'bot' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
      // Basic bolding support
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  return (
    <div className="flex flex-col h-full bg-page relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-card rounded-[24px] p-6 shadow-2xl w-full max-w-xs relative animate-in zoom-in-95 duration-200 border border-white/10">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary bg-surface rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
               <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-4 rotate-3">
                 <Sparkles className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold text-primary">Your AI Coach</h3>
            </div>
            
            <div className="space-y-4 text-sm text-secondary text-left">
              <div className="bg-surface p-3 rounded-xl border border-border">
                <strong className="text-primary block mb-1">🧠 Brainstorming</strong>
                Break down complex tasks into small steps.
              </div>
              <div className="bg-surface p-3 rounded-xl border border-border">
                <strong className="text-primary block mb-1">🛡️ Anti-Distraction</strong>
                Tell me if you're tempted to scroll. I'll help.
              </div>
              <div className="bg-surface p-3 rounded-xl border border-border">
                <strong className="text-primary block mb-1">⚡ Motivation</strong>
                Get a quick pep talk when energy is low.
              </div>
            </div>

            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-brand text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:bg-orange-800 transition-all ios-hover-wiggle"
            >
              Let's Focus
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-8 pb-4 px-6 bg-page/80 backdrop-blur-md sticky top-0 z-10 border-b border-border flex justify-between items-center">
        <div>
            <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-primary">AI Coach</h1>
                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold border border-brand/20">BETA</span>
            </div>
            <button 
                onClick={() => setShowHelp(true)}
                className="mt-1 flex items-center text-xs font-medium text-secondary hover:text-brand transition-colors"
            >
                <Info className="w-3 h-3 mr-1" />
                What can I do?
            </button>
        </div>
        
        <button 
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all border bg-card text-primary border-border hover:bg-surface ios-press-btn"
        >
            <User className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white mr-3 shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                </div>
            )}
            
            <div 
              className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.sender === 'user' 
                  ? 'bg-primary text-page rounded-br-sm font-medium' 
                  : 'bg-card text-primary rounded-tl-sm border border-border'
              }`}
            >
              {renderMessageText(msg.text)}
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start w-full">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white mr-3 shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-card p-4 rounded-2xl rounded-tl-sm border border-border flex items-center space-x-1.5 h-[54px]">
                    <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (Only show if minimal history) */}
      {messages.length < 3 && !isLoading && (
          <div className="px-6 mb-4">
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                  {SUGGESTIONS.map((s, i) => {
                      const Icon = s.icon;
                      return (
                          <button
                            key={i}
                            onClick={() => handleSend(s.prompt)}
                            className="flex items-center space-x-2 whitespace-nowrap bg-card border border-border px-4 py-2.5 rounded-full text-xs font-semibold text-secondary hover:text-primary hover:border-brand/50 hover:bg-surface transition-all active:scale-95 shadow-sm"
                          >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{s.label}</span>
                          </button>
                      )
                  })}
              </div>
          </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-page/90 backdrop-blur-md border-t border-border pb-28">
        <div className="relative flex items-end bg-surface rounded-[24px] shadow-sm border border-border focus-within:ring-2 focus-within:ring-brand/20 transition-all p-1">
          <textarea
            rows={1}
            placeholder="Ask FocusBuddy..."
            className="flex-1 bg-transparent py-3.5 pl-4 pr-12 focus:outline-none text-primary placeholder:text-secondary/50 resize-none max-h-32 text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-2.5 rounded-full transition-all duration-300 ${
                input.trim() 
                ? 'bg-brand text-white shadow-md hover:scale-105 active:scale-95' 
                : 'bg-border/50 text-secondary cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
