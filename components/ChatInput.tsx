
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="w-full relative z-10">
      <div className="max-w-4xl mx-auto relative group">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-[35px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000"></div>

        <div className="relative flex items-end bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl shadow-emerald-500/5 hover:border-emerald-500/40 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all duration-500 backdrop-blur-2xl pr-2 pl-4 py-2 overflow-hidden">

          <div className="mb-2 flex items-center gap-1 shrink-0">
            <button className="p-3 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all active:scale-95">
              <Mic size={22} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ސުވާލެއް އަހާލުމަށް މިތަނުގައި ލިޔުއްވާ..."
            disabled={disabled}
            className="w-full bg-transparent border-none py-4 px-4 focus:ring-0 focus:outline-none transition-all resize-none thaana-text text-[20px] md:text-[23px] min-h-[56px] text-right text-slate-800 dark:text-slate-100 leading-relaxed font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 custom-scrollbar"
            style={{ direction: 'rtl' }}
          />

          <div className="mb-2 flex items-center gap-2 shrink-0 pr-2">
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-3.5 rounded-2xl transition-all duration-500 transform active:scale-90 ${input.trim() && !disabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                }`}
            >
              <Send size={20} className="transform scale-x-[-1]" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-slate-400 dark:text-slate-500 thaana-text font-bold opacity-60">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors">
            <Sparkles size={12} className="text-emerald-500 animate-pulse" />
            <span>ދިވެހި GPT އަކީ އޭއައި އެކެވެ. ބައެއް ފަހަރު ކުށް މައުލޫމާތު ދެވިދާނެއެވެ.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
