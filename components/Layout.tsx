
import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="flex h-screen w-full bg-white overflow-hidden" dir="rtl">
      {/* Sidebar - Positioned on the Right for RTL */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 bg-[#0b0d0e] flex flex-col h-full overflow-hidden text-gray-300 shrink-0 border-l border-gray-800`}
      >
        <div className="p-4 flex flex-col h-full w-72">
          <button 
            onClick={onNewChat}
            className="flex items-center justify-between w-full px-4 py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-600/20 transition-all mb-6 group"
          >
            <div className="flex items-center gap-3">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="font-bold thaana-text">އައު ޗެޓެއް</span>
            </div>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-1">
            <p className="px-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2 thaana-text">ޗެޓް ހިސްޓްރީ</p>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-right group ${
                  currentSessionId === session.id 
                    ? 'bg-emerald-600/10 text-emerald-400' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={16} className={currentSessionId === session.id ? 'text-emerald-500' : 'text-gray-600'} />
                <span className="truncate text-sm thaana-text flex-1">{session.title}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-right text-gray-400">
              <Settings size={18} />
              <span className="text-sm thaana-text">ސެޓިންގްސް</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-right text-red-400/70 hover:text-red-400">
              <LogOut size={18} />
              <span className="text-sm thaana-text">ލޮގް އައުޓް</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white min-w-0 h-full">
        <header className="h-14 border-b bg-white/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              title={isSidebarOpen ? "ސައިޑްބާ ކްލޯޒް ކުރޭ" : "ސައިޑްބާ ހުޅުވާ"}
            >
              {isSidebarOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center text-white shadow-sm">
                <span className="text-[10px] font-black">DV</span>
              </div>
              <h1 className="font-bold text-gray-800 text-sm md:text-base">Test Dhivehi GPT</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">PRO</div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
