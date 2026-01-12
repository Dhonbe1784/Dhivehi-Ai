
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, Role, ChatSession } from './types';
import { geminiService, StreamResult } from './services/geminiService';
import { Sparkles, BrainCircuit, Languages, Globe, Zap, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingMap, setGroundingMap] = useState<Record<string, any[]>>({});
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

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !content.trim() || isTyping) return;
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content,
      timestamp: new Date(),
    };

    const historyForService = currentSession?.messages || [];

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? (content.length > 25 ? content.substring(0, 25) + '...' : content) : s.title,
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
      let lastGrounding: any[] = [];
      const stream = geminiService.streamChat(historyForService, content);

      for await (const chunk of stream) {
        const { text, groundingChunks } = chunk as StreamResult;
        fullContent += text;
        if (groundingChunks) {
          lastGrounding = [...lastGrounding, ...groundingChunks];
        }

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

      if (lastGrounding.length > 0) {
        setGroundingMap(prev => ({ ...prev, [botMessageId]: lastGrounding }));
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
      console.error("Pro Session Error:", err);
      const errorMessage = "މައާފް ކުރައްވާ، މައްސަލައެއް ދިމާވެއްޖެ. އަލުން މަސައްކަތް ކޮށްލައްވާ.";
      setError(errorMessage);
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => 
              m.id === botMessageId ? { ...m, content: errorMessage, isStreaming: false } : m
            )
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
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 rotate-6 transform hover:rotate-0 transition-transform duration-500">
          <Sparkles size={48} />
        </div>
      </div>
      
      <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 thaana-text tracking-tight">މިއަދު ކިހިނެއް އެހީތެރިވެދެވޭނީ؟</h2>
      <p className="text-gray-500 max-w-xl mb-16 thaana-text text-xl md:text-2xl font-light">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، ކަންކަން އޮޅުން ފިލުވުމަށް ތައްޔާރުކުރެވިފައިވާ އެންމެ ޒަމާނީ އޭއައި އެސިސްޓެންޓް.
      </p>

      {error && (
        <div className="mb-10 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 thaana-text shadow-sm animate-bounce">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {[
          {
            title: "ތާރީހީ މައުލޫމާތު",
            desc: "ދިވެހިރާއްޖޭގެ މުއްސަނދި ތާރީހާއި ސަގާފަތާ ބެހޭގޮތުން ސުވާލުކުރައްވާ.",
            icon: <BrainCircuit size={24} />,
            color: "emerald",
            prompt: "ދިވެހިރާއްޖޭގެ ތާރީހާ ބެހޭގޮތުން ކުރުކޮށް ކިޔައިދީ"
          },
          {
            title: "ބަހުގެ އެހީތެރިކަން",
            desc: "ލިޔުންތައް އިސްލާހުކުރުމަށާއި ބަހުގެ ގަވާއިދަށް އެހީތެރިވެދޭނެ.",
            icon: <Languages size={24} />,
            color: "blue",
            prompt: "ދިވެހި ބަހުގެ ގަވާއިދުގައި 'ކަށަވަށް' މި ބަހުގެ މާނައަކީ ކޮބައި؟"
          },
          {
            title: "ދުނިޔޭގެ ޚަބަރު",
            desc: "މިއަދުގެ އެންމެ ފަހުގެ ޚަބަރުތައް ހޯދައި އޮޅުންފިލުވާ.",
            icon: <Globe size={24} />,
            color: "orange",
            prompt: "މިއަދު ދުނިޔޭގައި ހިނގަމުންދާ އެންމެ މުހިންމު 3 ޚަބަރެއް ކިޔައިދީ"
          }
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            className={`group bg-white p-7 rounded-[2.5rem] border border-gray-100 hover:border-${item.color}-200 hover:shadow-2xl transition-all text-right flex flex-col items-start gap-6 transform hover:-translate-y-2`}
          >
            <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 thaana-text text-xl">{item.title}</h3>
              <p className="text-sm text-gray-400 thaana-text leading-relaxed">{item.desc}</p>
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
    >
      <div className="flex-1 flex flex-col min-h-0 chat-bg-pattern relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-[5] pointer-events-none"></div>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth pt-12"
        >
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col pb-40">
              {currentSession.messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  groundingChunks={groundingMap[msg.id]} 
                />
              ))}
              {isTyping && !currentSession.messages[currentSession.messages.length - 1].isStreaming && (
                <div className="py-12 bg-gray-50/30">
                   <div className="max-w-4xl mx-auto px-4 md:px-8 flex gap-8">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-pulse">
                        <Sparkles size={22} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-bounce"></div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-2">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
