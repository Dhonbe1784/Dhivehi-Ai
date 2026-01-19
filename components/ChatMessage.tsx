
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
    <div className={`w-full animate-fade-in ${isUser ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100/50 dark:border-slate-800/50'}`}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 flex gap-6 md:gap-12">
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-md border transition-all duration-300 ${isUser
          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-600 shadow-slate-100 dark:shadow-slate-950/50'
          : 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20'
          }`}>
          {isUser ? <User size={24} /> : <Bot size={24} />}
        </div>

        <div className="flex-1 min-w-0 flex flex-col pt-1">
          <div className={`flex items-center gap-3 mb-4 ${textDir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-sans">
              {isUser ? 'ތިބާ' : 'Beta Dhivehi AI'}
            </span>
            {!isUser && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[8px] font-black tracking-tighter uppercase">
                Verified
              </div>
            )}
          </div>

          <div
            className={`leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words thaana-text text-[22px] md:text-[24px] font-normal leading-[1.8] ${textDir === 'rtl' ? 'text-right' : 'text-left'}`}
            style={{ direction: textDir }}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2.5 h-6 bg-emerald-500/40 animate-pulse mr-3 align-middle rounded-full"></span>
            )}
          </div>

          {!isUser && !message.isStreaming && message.content.length > 0 && (
            <div className={`flex items-center gap-2 mt-10 p-1.5 w-fit rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors ${textDir === 'rtl' ? 'ml-auto' : 'mr-auto'}`}>
              <button
                onClick={handleCopy}
                className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-2 active:scale-90"
                title="ކޮޕީ ކުރޭ"
              >
                {copied ? <Check size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={18} />}
                {copied && <span className="text-xs font-bold thaana-text">ކޮޕީ ކުރެވިއްޖެ</span>}
              </button>
              <div className="h-5 w-px bg-slate-100 dark:bg-slate-800 mx-1"></div>
              <button className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-90">
                <ThumbsUp size={18} />
              </button>
              <button className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-90">
                <ThumbsDown size={18} />
              </button>
              <button className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-90">
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
