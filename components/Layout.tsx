
import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, UserRound } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNewChat: () => void;
  sessions: { id: string; title: string }[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  onNewChat,
  sessions,
  currentSessionId,
  onSelectSession
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 overflow-hidden transition-all duration-500 ease-in-out" dir="rtl">
      {/* Sidebar - Positioned on the Right for RTL */}
      <aside
        className={`${isSidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-500 ease-in-out bg-[#0f172a] dark:bg-[#020617] flex flex-col h-full overflow-hidden text-slate-300 shrink-0 border-l border-slate-800 dark:border-slate-900 shadow-2xl z-20`}
      >
        <div className="p-6 flex flex-col h-full w-80">
          <button
            onClick={onNewChat}
            className="flex items-center justify-between w-full px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all mb-8 group shadow-lg shadow-emerald-500/5"
          >
            <div className="flex items-center gap-3">
              <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-bold thaana-text tracking-tight">އައު ޗެޓެއް</span>
            </div>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 font-mono text-[10px] font-medium text-emerald-400 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 mb-6 custom-scrollbar pr-1">
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4 thaana-text opacity-80">ޗެޓް ހިސްޓްރީ</p>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right group relative overflow-hidden ${currentSessionId === session.id
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-inner'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'
                  }`}
              >
                {currentSessionId === session.id && (
                  <div className="absolute inset-y-0 right-0 w-1 bg-emerald-500 rounded-full" />
                )}
                <MessageSquare size={18} className={currentSessionId === session.id ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'} />
                <span className="truncate text-[15px] thaana-text flex-1 font-medium">{session.title}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800/60 space-y-2">
            {/* Creator name section */}
            <div className="px-4 py-4 flex items-center gap-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <UserRound size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Crafted by</span>
                <span className="text-sm font-bold text-slate-200">Dhonbe & Kudoo</span>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-all text-right text-slate-400 hover:text-emerald-500 group">
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm thaana-text font-medium">ސެޓިންގްސް</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-all text-right text-slate-500 hover:text-emerald-500 group">
              <LogOut size={18} />
              <span className="text-sm thaana-text font-medium">ލޮގް އައުޓް</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 min-w-0 h-full overflow-hidden transition-all duration-500 ease-in-out">
        <header className="h-16 border-b border-slate-100 dark:border-slate-900 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center px-6 justify-between shrink-0 sticky top-0 z-10 transition-all duration-500">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all shadow-sm active:scale-95"
              title={isSidebarOpen ? "ސައިޑްބާ ކްލޯޒް ކުރޭ" : "ސައިޑްބާ ހުޅުވާ"}
            >
              {isSidebarOpen ? <ChevronRight size={22} /> : <Menu size={22} />}
            </button>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-900 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                <span className="text-xs font-black tracking-tighter">DV</span>
              </div>
              <div className="flex flex-col -gap-1">
                <h1 className="font-bold text-slate-900 dark:text-white text-sm md:text-base tracking-tight leading-tight">Beta Dhivehi AI</h1>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-500/20 tracking-widest">PREMIUM</div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
