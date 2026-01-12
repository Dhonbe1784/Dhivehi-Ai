
import React from 'react';
import { Role, Message } from '../types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = React.useState(false);

  const isDhivehi = (text: string) => {
    const thaanaRange = /[\u0780-\u07B1]/;
    return thaanaRange.test(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textDir = isDhivehi(message.content) ? 'rtl' : 'ltr';

  return (
    <div className={`w-full ${isUser ? 'bg-transparent' : 'bg-gray-50/50 border-y border-gray-100'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex gap-4 md:gap-8">
        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-white border border-gray-200 text-gray-600' 
            : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col">
          <div className={`flex items-center gap-2 mb-2 ${textDir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest thaana-text">
               {isUser ? 'ތިބާ' : 'ދިވެހި GPT'}
             </span>
          </div>

          <div 
            className={`leading-relaxed text-gray-800 whitespace-pre-wrap break-words thaana-text text-[19px] md:text-[21px] ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}
            style={{ direction: textDir }}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-6 bg-emerald-500 animate-pulse mr-2 align-middle rounded-full"></span>
            )}
          </div>

          {!isUser && !message.isStreaming && (
            <div className={`flex items-center gap-3 mt-6 ${textDir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
              <button 
                onClick={handleCopy}
                className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-600 transition-all flex items-center gap-1.5"
                title="ਕޮਪީ ކުރޭ"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied && <span className="text-[10px] font-bold thaana-text">ކޮޕީ ކުރެވިއްޖެ</span>}
              </button>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <button className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-600 transition-all">
                <ThumbsUp size={14} />
              </button>
              <button className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-600 transition-all">
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
