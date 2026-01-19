
import { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, Role, ChatSession } from './types';
import { geminiService } from './services/geminiService';
import { Sparkles, BrainCircuit, Languages, Globe, AlertCircle, Clock, Trash2, Moon, Sun } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';

const App = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewChat();
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
        <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 ring-8 ring-emerald-50 active:scale-95 transition-transform">
          <Sparkles size={48} className="animate-pulse" />
        </div>
      </div>

      <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 thaana-text tracking-tight leading-tight">މިއަދު ކިހިނެއް އެހީތެރިވެދެވޭނީ؟</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-xl mb-16 thaana-text text-xl md:text-2xl font-medium opacity-80 leading-relaxed">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، ކަންކަން އޮޅުން ފިލުވުމަށް ތައްޔާރުކުރެވިފައިވާ <span className="text-emerald-600 dark:text-emerald-400 font-bold">އޭއައި އެސިސްޓެންޓް</span>.
      </p>

      {cooldown > 0 && (
        <div className="mb-12 p-8 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-[2.5rem] text-red-800 dark:text-red-400 flex flex-col items-center gap-5 thaana-text max-w-lg shadow-xl shadow-red-500/5 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <Clock size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-black text-right leading-relaxed text-red-800 dark:text-red-400">ގޫގުލްގެ ހިލޭ ލިމިޓް ހަމަވެއްޖެ</span>
            <span className="text-sm opacity-70">އަލުން ފޮނުވޭނީ {cooldown} ސިކުންތު ފަުން</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {[
          { title: "ތާރީހު", icon: <BrainCircuit size={24} />, color: "emerald", prompt: "ދިވެހިރާއްޖޭގެ ތާރީހާ ބެހޭގޮތުން ކިޔައިދީ", desc: "ރާއްޖޭގެ މުއްސަނދި ތާރީހު" },
          { title: "ބަސް", icon: <Languages size={24} />, color: "blue", prompt: "ދިވެހި ބަހުގެ ގަވާއިދާ ބެހޭގޮތުން ސުވާލެއް", desc: "ބަހުގެ ހަމަތަކާއި ގަވާއިދު" },
          { title: "މައުލޫމާތު", icon: <Globe size={24} />, color: "orange", prompt: "ފައިދާހުރި ކާނާއަކީ ކޮބައި؟", desc: "އާންމު މައުލޫމާތާއި އިރުޝާދު" }
        ].map((item, idx) => (
          <button
            key={idx}
            disabled={cooldown > 0}
            onClick={() => handleSendMessage(item.prompt)}
            className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 text-right flex flex-col items-center gap-4 disabled:opacity-50 active:scale-95"
          >
            <div className={`w-14 h-14 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-${item.color}-100 dark:border-${item.color}-900/30`}>
              {item.icon}
            </div>
            <div className="flex flex-col items-center gap-1">
              <h3 className="font-black text-slate-800 dark:text-slate-100 thaana-text text-xl">{item.title}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 thaana-text font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.desc}</p>
            </div>
            <div className="mt-2 w-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-500" />
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
    >
      <div className="flex-1 flex flex-col min-h-0 chat-bg-pattern relative transition-all duration-500">
        <header className="h-14 flex items-center px-4 justify-between border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 transition-all duration-500">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 text-gray-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-500 flex items-center gap-2"
              title="ހިސްޓްރީ ފޮހެލާ"
            >
              <Trash2 size={18} />
              <span className="text-xs font-bold thaana-text hidden sm:inline">ހިސްޓްރީ ފޮހެލާ</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle
              isDarkMode={isDarkMode}
              onToggle={() => setIsDarkMode(!isDarkMode)}
            />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            {cooldown > 0 && <span className="text-[10px] font-bold text-red-500 animate-pulse">{cooldown}s</span>}
            <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-tighter">Connected</div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pt-4">
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col pb-40">
              {currentSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex gap-4 md:gap-10">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 border border-emerald-500 text-white flex items-center justify-center animate-pulse">
                    <Sparkles size={22} />
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              )}
              {error && (
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 thaana-text">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent pt-8 pb-2 transition-all duration-500">
          <ChatInput onSend={handleSendMessage} disabled={isTyping || cooldown > 0} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
