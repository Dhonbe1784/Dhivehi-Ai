
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
    <div className="w-full px-4 pb-8 md:pb-12 pt-4 relative z-10">
      <div className="max-w-4xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-end bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[30px] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/40 focus-within:ring-4 focus-within:ring-emerald-500/5 dark:focus-within:ring-emerald-500/10 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all pr-3 pl-3 overflow-hidden backdrop-blur-xl">

          <button className="mb-3 p-2.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all shrink-0 active:scale-90">
            <Mic size={22} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ސުވާލެއް އަހާލުމަށް މިތަނުގައި ލިޔުއްވާ..."
            disabled={disabled}
            className="w-full bg-transparent border-none py-5 px-5 focus:ring-0 focus:outline-none transition-all resize-none thaana-text text-[20px] md:text-[22px] min-h-[64px] text-right text-slate-800 dark:text-slate-100 leading-relaxed font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
            style={{ direction: 'rtl' }}
          />

          <div className="mb-3 flex items-center gap-2 shrink-0">
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-3 rounded-2xl transition-all transform active:scale-95 ${input.trim() && !disabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                }`}
            >
              <Send size={20} className="transform scale-x-[-1]" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 text-[11px] text-slate-400 dark:text-slate-500 thaana-text font-bold opacity-70 tracking-wide">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-slate-800/50 transition-colors">
            <Sparkles size={12} className="text-emerald-500 dark:text-emerald-400" />
            <span>ދިވެހި GPT އަކީ އޭއައި އެކެވެ. ބައެއް ފަހަރު ކުށް މައުލޫމާތު ދެވިދާނެއެވެ.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
