
import React from 'react';
import { Role, Message } from '../types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Check, Share2, Globe } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  groundingChunks?: any[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, groundingChunks }) => {
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

  // Extract unique URLs from grounding chunks
  const sources = groundingChunks
    ?.map(chunk => chunk.web?.uri)
    .filter((uri, index, self) => uri && self.indexOf(uri) === index) || [];

  return (
    <div className={`w-full ${isUser ? 'bg-transparent' : 'bg-gray-50/70 border-y border-gray-100/50'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex gap-4 md:gap-10">
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm border transition-all ${
          isUser 
            ? 'bg-white border-gray-200 text-gray-500' 
            : 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/10'
        }`}>
          {isUser ? <User size={22} /> : <Bot size={22} />}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col">
          <div className={`flex items-center gap-2 mb-3 ${textDir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] thaana-text">
               {isUser ? 'ތިބާ' : 'BETA DHIVEHI AI'}
             </span>
          </div>

          <div 
            className={`leading-relaxed text-gray-800 whitespace-pre-wrap break-words thaana-text text-[20px] md:text-[22px] font-normal ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}
            style={{ direction: textDir }}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-6 bg-emerald-500/50 animate-pulse mr-2 align-middle rounded-full"></span>
            )}
          </div>

          {!isUser && sources.length > 0 && (
            <div className="mt-6 border-t border-gray-200/50 pt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 thaana-text">
                <Globe size={12} /> މަސްދަރުތައް (Sources)
              </p>
              <div className="flex flex-wrap gap-2">
                {sources.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] text-emerald-600 hover:border-emerald-500 transition-all flex items-center gap-2 shadow-sm truncate max-w-[200px]"
                  >
                    <span className="truncate">{new URL(url).hostname}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!isUser && !message.isStreaming && message.content.length > 0 && (
            <div className={`flex items-center gap-4 mt-8 ${textDir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-all flex items-center gap-2 border border-transparent hover:border-emerald-100"
                title="ކޮޕީ ކުރޭ"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                {copied && <span className="text-xs font-bold thaana-text">ކޮޕީ ކުރެވިއްޖެ</span>}
              </button>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-all">
                <ThumbsUp size={16} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                <ThumbsDown size={16} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-all">
                <Share2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;