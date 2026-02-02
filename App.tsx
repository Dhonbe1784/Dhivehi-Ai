
import { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, Role, ChatSession } from './types';
import { geminiService } from './services/geminiService';
import { Sparkles, BrainCircuit, Languages, Globe, AlertCircle, Clock, Trash2, Moon, Sun } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';

const App = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('chat-sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((session: any) => ({
          ...session,
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp)
          }))
        }));
      }
    } catch (e) {
      console.error('Error loading sessions:', e);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem('current-session-id');
  });

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('current-session-id', currentSessionId);
    } else {
      localStorage.removeItem('current-session-id');
    }
  }, [currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewChat();
    } else if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isTyping]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (cooldown === 0 && error) {
      // Clear generic rate limit error once cooldown is over
      if (error.includes("ލިމިޓް")) {
        setError(null);
      }
    }
  }, [cooldown, error]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'އައު ޗެޓެއް',
      messages: [],
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setError(null);
  };

  const handleClearHistory = () => {
    if (!currentSessionId) return;
    setSessions(prev => prev.map(s =>
      s.id === currentSessionId ? { ...s, messages: [], updatedAt: new Date() } : s
    ));
    setError(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !content.trim() || isTyping || cooldown > 0) return;

    // Clear previous error when starting a new message
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content,
      timestamp: new Date(),
    };

    const historySnapshot = currentSession?.messages || [];

    // Optimistically update the UI with user message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? (content.length > 20 ? content.substring(0, 20) + '...' : content) : s.title,
          messages: [...s.messages, userMessage],
          updatedAt: new Date()
        };
      }
      return s;
    }));

    setIsTyping(true);

    try {
      const result = await geminiService.sendMessage(historySnapshot, content);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.MODEL,
        content: result.text,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMessage],
            updatedAt: new Date()
          };
        }
        return s;
      }));
    } catch (err: any) {
      console.error("Dhivehi GPT Error:", err);
      const errorStr = String(err).toUpperCase();

      if (errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429")) {
        setError("ގޫގުލްގެ ހިލޭ ލިމިޓް ހަމަވެއްޖެ. ކުޑަކޮށް މަޑުކޮށްލެއްވުމަށްފަހު އަލުން މަސައްކަތް ކޮށްލައްވާ.");
        setCooldown(30);
      } else if (errorStr.includes("SAFETY")) {
        setError("މައާފް ކުރައްވާ، ތިޔަ ސުވާލަށް ޖަވާބު ދެވޭކަށް ނެތް (Safety Block).");
      } else if (errorStr.includes("API_KEY") || errorStr.includes("NOT_FOUND")) {
        setError("އޭޕީއައި ކީ މައްސަލައެއް އުޅޭހެން ހީވޭ. ސެޓިންގްސް ޗެކް ކޮށްލައްވާ.");
      } else {
        setError("މައާފް ކުރައްވާ، ކޮންމެވެސް މައްސަލައެއް ދިމާވެއްޖެ. އަލުން މަސައްކަތް ކޮށްލައްވާ.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center bg-transparent gradient-mesh animate-fade-in">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-20 animate-pulse"></div>
        <div className="relative w-28 h-28 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 ring-8 ring-emerald-50 dark:ring-emerald-900/10 active:scale-95 transition-all duration-500 hover:rotate-6">
          <Sparkles size={56} className="animate-pulse" />
        </div>
      </div>

      <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 thaana-text tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
        މިއަދު ކިހިނެއް <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">އެހީތެރިވެދެވޭނީ؟</span>
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-2xl mb-20 thaana-text text-xl md:text-2xl font-medium opacity-80 leading-relaxed">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، ކަންކަން އޮޅުން ފިލުވުމަށް ތައްޔާރުކުރެވިފައިވާ އެންމެ ފަހުގެ <span className="text-emerald-600 dark:text-emerald-400 font-bold">އޭއައި އެސިސްޓެންޓް</span>.
      </p>

      {cooldown > 0 && (
        <div className="mb-16 p-8 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-[3rem] text-red-800 dark:text-red-400 flex flex-col items-center gap-5 thaana-text max-w-lg shadow-2xl shadow-red-500/5 animate-pulse relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 relative z-10">
            <Clock size={32} />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-xl font-black text-center leading-relaxed">ގޫގުލްގެ ހިލޭ ލިމިޓް ހަމަވެއްޖެ</span>
            <span className="text-sm opacity-70 font-bold">އަލުން ފޮނުވޭނީ {cooldown} ސިކުންތު ފަހުން</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {[
          { title: "ތާރީހު", icon: <BrainCircuit size={28} />, color: "emerald", prompt: "ދިވެހިރާއްޖޭގެ ތާރީހާ ބެހޭގޮތުން ކިޔައިދީ", desc: "ރާއްޖޭގެ މުއްސަނދި ތާރީހު" },
          { title: "ބަސް", icon: <Languages size={28} />, color: "blue", prompt: "ދިވެހި ބަހުގެ ގަވާއިދާ ބެހޭގޮތުން ސުވާލެއް", desc: "ބަހުގެ ހަމަތަކާއި ގަވާއިދު" },
          { title: "މައުލޫމާތު", icon: <Globe size={28} />, color: "orange", prompt: "ފައިދާހުރި ކާނާއަކީ ކޮބައި؟", desc: "އާންމު މައުލޫމާތާއި އިރުޝާދު" }
        ].map((item, idx) => (
          <button
            key={idx}
            disabled={cooldown > 0}
            onClick={() => handleSendMessage(item.prompt)}
            className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-900 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-700 text-right flex flex-col items-center gap-6 disabled:opacity-50 active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100 dark:bg-slate-800 transition-all duration-700 group-hover:bg-emerald-500"></div>
            <div className={`w-16 h-16 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sm border border-${item.color}-100/50 dark:border-${item.color}-900/20`}>
              {item.icon}
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-black text-slate-800 dark:text-slate-100 thaana-text text-2xl">{item.title}</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 thaana-text font-bold transition-all duration-700 group-hover:text-slate-600 dark:group-hover:text-slate-300">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Layout
      sessions={sessions.map(s => ({ id: s.id, title: s.title }))}
      currentSessionId={currentSessionId}
      onNewChat={handleNewChat}
      onSelectSession={(id) => setCurrentSessionId(id)}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
            title="ހިސްޓްރީ ފޮހެލާ"
          >
            <Trash2 size={18} />
            <span className="text-xs font-bold thaana-text hidden lg:inline">ފޮހެލާ</span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
          />
        </div>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 chat-bg-pattern relative transition-all duration-500">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pt-4 custom-scrollbar">
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col pb-40">
              {currentSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-10 flex gap-4 md:gap-10">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 border border-emerald-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
                    <Sparkles size={22} />
                  </div>
                  <div className="flex-1 flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-duration:1s]"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.2s] [animation-duration:1s]"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.4s] [animation-duration:1s]"></div>
                  </div>
                </div>
              )}
              {error && (
                <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-4">
                  <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-800 dark:text-red-400 thaana-text shadow-xl shadow-red-500/5">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <span className="text-base font-bold leading-relaxed">{error}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 bg-transparent relative z-10 px-4 pb-4">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-[#020617] via-white/80 dark:via-[#020617]/80 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto relative">
            <ChatInput onSend={handleSendMessage} disabled={isTyping || cooldown > 0} />
            <p className="text-[10px] text-center mt-3 text-slate-400 dark:text-slate-500 font-medium">
              Dhivehi AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
