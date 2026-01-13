
import { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, Role, ChatSession } from './types';
import { geminiService } from './services/geminiService';
import { Sparkles, BrainCircuit, Languages, Globe, AlertCircle, Clock, Trash2 } from 'lucide-react';

const App = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    }
  }, [cooldown]);

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
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content,
      timestamp: new Date(),
    };

    const historySnapshot = currentSession?.messages || [];

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

    const botMessageId = crypto.randomUUID();
    const botMessage: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, botMessage] };
      }
      return s;
    }));

    try {
      let fullContent = "";
      const stream = geminiService.streamChat(historySnapshot, content);

      for await (const text of stream) {
        fullContent += text;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => 
                m.id === botMessageId ? { ...m, content: fullContent } : m
              )
            };
          }
          return s;
        }));
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => 
              m.id === botMessageId ? { ...m, isStreaming: false } : m
            )
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
      } else {
        setError("މައާފް ކުރައްވާ، ކޮންމެވެސް މައްސަލައެއް ދިމާވެއްޖެ. އަލުން މަސައްކަތް ކޮށްލައްވާ.");
      }
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.filter(m => m.id !== botMessageId)
          };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-transparent gradient-mesh">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
          <Sparkles size={40} />
        </div>
      </div>
      
      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 thaana-text tracking-tight">މިއަދު ކިހިނެއް އެހީތެރިވެދެވޭނީ؟</h2>
      <p className="text-gray-500 max-w-lg mb-12 thaana-text text-lg md:text-xl font-light">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، ކަންކަން އޮޅުން ފިލުވުމަށް ތައްޔާރުކުރެވިފައިވާ އޭއައި އެސިސްޓެންޓް.
      </p>

      {cooldown > 0 && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-[2rem] text-red-800 flex flex-col items-center gap-4 thaana-text max-w-lg shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Clock size={24} className="shrink-0 text-red-600" />
            <span className="text-sm font-bold text-right leading-relaxed">ގޫގުލްގެ ހިލޭ ލިމިޓް ހަމަވެއްޖެ. އަލުން ފޮނުވޭނީ {cooldown} ސިކުންތު ފަހުން.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl px-4">
        {[
          { title: "ތާރީހު", icon: <BrainCircuit size={20} />, color: "emerald", prompt: "ދިވެހިރާއްޖޭގެ ތާރީހާ ބެހޭގޮތުން ކިޔައިދީ" },
          { title: "ބަސް", icon: <Languages size={20} />, color: "blue", prompt: "ދިވެހި ބަހުގެ ގަވާއިދާ ބެހޭގޮތުން ސުވާލެއް" },
          { title: "މައުލޫމާތު", icon: <Globe size={20} />, color: "orange", prompt: "ފައިދާހުރި ކާނާއަކީ ކޮބައި؟" }
        ].map((item, idx) => (
          <button 
            key={idx}
            disabled={cooldown > 0}
            onClick={() => handleSendMessage(item.prompt)}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all text-right flex flex-col items-center gap-3 disabled:opacity-50"
          >
            <div className={`w-10 h-10 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-gray-800 thaana-text">{item.title}</h3>
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
      <div className="flex-1 flex flex-col min-h-0 chat-bg-pattern relative">
        <header className="h-14 flex items-center px-4 justify-between border-b bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClearHistory}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
              title="ހިސްޓްރީ ފޮހެލާ"
            >
              <Trash2 size={18} />
              <span className="text-xs font-bold thaana-text hidden sm:inline">ހިސްޓްރީ ފޮހެލާ</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {cooldown > 0 && <span className="text-[10px] font-bold text-red-500 animate-pulse">{cooldown}s</span>}
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100 uppercase tracking-tighter">Connected</div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth pt-4">
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col pb-40">
              {currentSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-2">
          {error && cooldown === 0 && (
             <div className="max-w-4xl mx-auto px-4 mb-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 thaana-text text-sm">
                   <AlertCircle size={16} />
                   <span>{error}</span>
                </div>
             </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={isTyping || cooldown > 0} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
