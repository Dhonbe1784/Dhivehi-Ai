
import React from 'react';
import { Role, Message } from '../types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Simple Dhivehi script detection to adjust alignment if mixed content
  const isDhivehi = (text: string) => {
    const thaanaRange = /[\u0780-\u07B1]/;
    return thaanaRange.test(text);
  };

  const textDir = isDhivehi(message.content) ? 'rtl' : 'ltr';

  return (
    <div className={`py-8 w-full ${isUser ? 'bg-white' : 'bg-gray-50 border-y border-gray-100'}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-6">
        <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center ${isUser ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        <div className="flex-1 min-w-0 space-y-4">
          <p className={`text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1 ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}>
            {isUser ? 'ތިބާ' : 'ދިވެހި GPT'}
          </p>
          <div 
            className={`leading-relaxed text-gray-800 whitespace-pre-wrap break-words thaana-text text-lg ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}
            style={{ direction: textDir }}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-emerald-500 animate-pulse ml-1 align-middle"></span>
            )}
          </div>

          {!isUser && !message.isStreaming && (
            <div className={`flex items-center gap-4 pt-4 ${textDir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
              <button className="p-1 hover:text-emerald-600 text-gray-400 transition-colors">
                <Copy size={16} />
              </button>
              <button className="p-1 hover:text-emerald-600 text-gray-400 transition-colors">
                <ThumbsUp size={16} />
              </button>
              <button className="p-1 hover:text-emerald-600 text-gray-400 transition-colors">
                <ThumbsDown size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
