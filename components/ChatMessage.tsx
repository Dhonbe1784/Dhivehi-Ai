
import React from 'react';
import { Role, Message } from '../types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Check, Share2 } from 'lucide-react';

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
    <div className={`w-full group px-4 py-8 md:py-12 transition-all duration-300 ${isUser ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/50 backdrop-blur-sm'}`}>
      <div className="max-w-4xl mx-auto flex gap-6 md:gap-10 items-start">
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-105 ${isUser
          ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20'
          }`}>
          {isUser ? <User size={24} /> : <Bot size={24} />}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isUser ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isUser ? 'ތިބާ' : 'Dhivehi AI'}
            </span>
            {!isUser && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase">
                Official
              </div>
            )}
          </div>

          <div
            className={`leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words thaana-text text-[22px] md:text-[25px] font-medium leading-[1.8] tracking-tight ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}
            style={{ direction: textDir }}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-6 bg-emerald-500/40 animate-pulse mr-3 align-middle rounded-full"></span>
            )}
          </div>

          {!isUser && !message.isStreaming && message.content.length > 0 && (
            <div className={`flex items-center gap-2 mt-8 p-1.5 w-fit rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 ${textDir === 'rtl' ? 'mr-auto' : 'ml-auto'}`}>
              <button
                onClick={handleCopy}
                className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-2 active:scale-95"
                title="ކޮޕީ ކުރޭ"
              >
                {copied ? <Check size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={18} />}
                {copied && <span className="text-xs font-bold thaana-text">ކޮޕީ ކުރެވިއްޖެ</span>}
              </button>
              <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-1"></div>
              <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-95">
                <ThumbsUp size={18} />
              </button>
              <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95">
                <ThumbsDown size={18} />
              </button>
              <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-all active:scale-95">
                <Share2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
