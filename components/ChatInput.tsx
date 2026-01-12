
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

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
    <div className="p-4 bg-transparent">
      <div className="max-w-3xl mx-auto relative group">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ސުވާލެއް އަހާލުމަށް މިތަނުގައި ލިޔުއްވާ..."
          disabled={disabled}
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pr-14 pl-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none thaana-text text-lg min-h-[56px] text-right"
          style={{ direction: 'rtl' }}
        />
        
        <div className="absolute right-3 bottom-3 flex items-center gap-1">
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`p-2 rounded-xl transition-all ${
              input.trim() && !disabled 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send size={20} className="transform scale-x-[-1]" />
          </button>
        </div>

        <div className="absolute left-3 bottom-3">
          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <Mic size={20} />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2 thaana-text">
        ދިވެހި GPT އަކީ އާޓިފިޝަލް އިންޓެލިޖެންސް އެކެވެ. ބައެއް ފަހަރު ކުށް މައުލޫމާތު ދެވިދާނެއެވެ.
      </p>
    </div>
  );
};

export default ChatInput;
