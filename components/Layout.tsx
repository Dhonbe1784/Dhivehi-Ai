
import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, UserRound, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNewChat: () => void;
  sessions: { id: string; title: string }[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  headerActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  onNewChat,
  sessions,
  currentSessionId,
  onSelectSession,
  headerActions
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#020617] overflow-hidden transition-all duration-500 ease-in-out font-thaana" dir="rtl">
      {/* Sidebar - Positioned on the Right for RTL */}
      <aside
        className={`${isSidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-500 ease-in-out bg-[#0f172a] dark:bg-[#020617] flex flex-col h-full overflow-hidden text-slate-300 shrink-0 border-l border-slate-200 dark:border-slate-900 shadow-2xl z-30 relative`}
      >
        <div className="flex flex-col h-full w-80">
          <div className="p-6">
            <button
              onClick={onNewChat}
              className="flex items-center justify-between w-full px-5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all mb-8 group shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-bold thaana-text text-lg">އައު ޗެޓެއް</span>
              </div>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-white/20 px-1.5 font-mono text-[10px] font-medium text-white opacity-80">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black thaana-text opacity-80">ޗެޓް ހިސްޓްރީ</p>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{sessions.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 px-3 mb-6 custom-scrollbar">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-right group relative overflow-hidden ${currentSessionId === session.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 border border-transparent'
                  }`}
              >
                <div className={`${currentSessionId === session.id ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`}>
                  <MessageSquare size={18} />
                </div>
                <span className="truncate text-sm thaana-text flex-1 font-medium">{session.title}</span>
                {currentSessionId === session.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800/60 bg-slate-900/50 space-y-2">
            <div className="px-4 py-4 flex items-center gap-3 bg-slate-800/40 rounded-2xl border border-white/5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <UserRound size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold truncate">Developed by</span>
                <span className="text-xs font-bold text-slate-200 truncate">Dhonbe & Kudoo</span>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-right text-slate-400 hover:text-white group">
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm thaana-text font-medium">ސެޓިންގްސް</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-right text-slate-500 hover:text-red-400 group">
              <LogOut size={18} />
              <span className="text-sm thaana-text font-medium">ލޮގް އައުޓް</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden transition-all duration-500 ease-in-out bg-white dark:bg-[#020617]">
        <header className="h-16 shrink-0 flex items-center px-6 justify-between border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-95 border border-slate-200/50 dark:border-slate-800/50"
            >
              {isSidebarOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <Sparkles size={18} />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1">Dhivehi AI</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 tracking-widest hidden sm:block">PRO</div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
