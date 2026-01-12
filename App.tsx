
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, Role, ChatSession } from './types';
import { geminiService } from './services/geminiService';
import { Sparkles, BrainCircuit, Languages, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (!currentSessionId) return;
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content,
      timestamp: new Date(),
    };

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
      const currentHistory = sessions.find(s => s.id === currentSessionId)?.messages || [];
      const stream = geminiService.streamChat(currentHistory, content);

      for await (const chunk of stream) {
        fullContent += chunk;
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
      console.error("Streaming error:", err);
      const errorMessage = err.message === "API_KEY_ERROR" 
        ? "API ކީ ބޭނުމެއް ނުކުރެވުނު. ސެޓިންގްސްގައި ކީ ރަނގަޅުތޯ ބައްލަވާލައްވާ."
        : "މައާފް ކުރައްވާ، ކޮންމެވެސް މައްސަލައެއް ދިމާވެއްޖެ. އަލުން މަސައްކަތް ކޮށްލައްވާ.";
      
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-transparent">
      <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-500/20">
        <Sparkles size={32} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 thaana-text tracking-tight">މިއަދު ކިހިނެއް އެހީތެރިވެދެވޭނީ؟</h2>
      <p className="text-gray-500 max-w-lg mb-12 thaana-text text-lg">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، މަސައްކަތްތައް ފަސޭހަކޮށްލުމަށް ދިވެހި GPT ބޭނުންކުރައްވާ.
      </p>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 thaana-text shadow-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <button 
          onClick={() => handleSendMessage("ދިވެހިރާއްޖޭގެ ތާރީހާ ބެހޭގޮތުން ކިޔައިދީ")}
          className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-right flex flex-col items-start gap-4"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1 thaana-text text-sm">ތާރީހީ މައުލޫމާތު</h3>
            <p className="text-xs text-gray-400 thaana-text">ދިވެހިރާއްޖޭގެ މުއްސަނދި ތާރީހާ ބެހޭގޮތުން ސުވާލުކުރައްވާ.</p>
          </div>
        </button>
        <button 
          onClick={() => handleSendMessage("ދިވެހި ބަހުގެ ގަވާއިދުތަކާ ބެހޭގޮތުން އެހީތެރިވެދީ")}
          className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-right flex flex-col items-start gap-4"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Languages size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1 thaana-text text-sm">ބަހުގެ އެހީތެރިކަން</h3>
            <p className="text-xs text-gray-400 thaana-text">ލިޔުންތައް އިސްލާހުކުރުމަށާއި ބަހުގެ ގަވާއިދަށް އެހީތެރިވެދޭނެ.</p>
          </div>
        </button>
        <button 
          onClick={() => handleSendMessage("މިއަދުގެ މޫސުމާ ބެހޭގޮތުން މައުލޫމާތު ހޯދައިދީ")}
          className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all text-right flex flex-col items-start gap-4"
        >
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1 thaana-text text-sm">އާންމު މައުލޫމާތު</h3>
            <p className="text-xs text-gray-400 thaana-text">ކޮންމެ ދާއިރާއަކުންވެސް ބޭނުންވާ މައުލޫމާތު އޮޅުންފިލުއްވާ.</p>
          </div>
        </button>
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
      <div className="flex-1 flex flex-col min-h-0 chat-bg">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col pb-20">
              {currentSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && !currentSession.messages[currentSession.messages.length - 1].isStreaming && (
                <div className="py-8 bg-gray-50/50 border-y border-gray-100">
                   <div className="max-w-4xl mx-auto px-4 md:px-8 flex gap-8">
                      <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm animate-pulse">
                        <Sparkles size={20} />
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-10">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
