
import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Settings, Github, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';

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
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-gray-900 flex flex-col h-full overflow-hidden text-gray-100 shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={onNewChat}
            className="flex items-center gap-3 px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors mb-6 text-right"
          >
            <Plus size={20} />
            <span className="font-medium thaana-text">އައު ޗެޓެއް</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-right ${
                  currentSessionId === session.id ? 'bg-gray-800 border-r-4 border-emerald-500' : ''
                }`}
              >
                <MessageSquare size={18} className="text-gray-400" />
                <span className="truncate text-sm thaana-text">{session.title}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-right">
              <Settings size={18} />
              <span className="text-sm thaana-text">ސެޓިންގްސް</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-right text-red-400">
              <LogOut size={18} />
              <span className="text-sm thaana-text">ލޮގް އައުޓް</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-gray-50 min-w-0 h-full">
        {/* Mobile / Toggle Header */}
        <header className="h-16 border-b bg-white flex items-center px-4 justify-between shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            {isSidebarOpen ? <ChevronRight size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-emerald-600">Test Dhivehi GPT</h1>
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white">
               <span className="text-xs font-bold">DV</span>
            </div>
          </div>

          <div className="w-10"></div> {/* Spacer */}
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
