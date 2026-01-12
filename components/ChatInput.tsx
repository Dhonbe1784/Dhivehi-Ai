
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
    <div className="w-full px-4 pb-4 md:pb-8 pt-2">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative flex items-end bg-white border border-gray-200 rounded-[28px] shadow-sm hover:shadow-md hover:border-emerald-500/30 focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500 transition-all pr-2 pl-2 overflow-hidden">
          
          <button className="mb-2.5 p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all shrink-0">
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
            className="w-full bg-transparent border-none py-4 px-4 focus:ring-0 focus:outline-none transition-all resize-none thaana-text text-[18px] md:text-[20px] min-h-[58px] text-right"
            style={{ direction: 'rtl' }}
          />
          
          <div className="mb-2.5 flex items-center gap-1 shrink-0">
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-2.5 rounded-full transition-all shadow-sm ${
                input.trim() && !disabled 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' 
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Send size={20} className="transform scale-x-[-1]" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 thaana-text font-medium opacity-80">
          <Sparkles size={10} className="text-emerald-500" />
          <span>ދިވެހި GPT އަކީ އޭއައި އެކެވެ. ބައެއް ފަހަރު ކުށް މައުލޫމާތު ދެވިދާނެއެވެ.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
