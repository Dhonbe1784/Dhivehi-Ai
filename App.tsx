
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
    // Initial session setup
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
        <Sparkles size={40} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4 thaana-text">Test Dhivehi GPT އަށް މަރުހަބާ</h2>
      <p className="text-gray-500 max-w-md mb-12 thaana-text text-lg">
        ދިވެހި ބަހުން ވާހަކަ ދެއްކުމަށާއި، ކަންކަން އޮޅުން ފިލުވުމަށް ތައްޔާރުކުރެވިފައިވާ ޒަމާނީ އޭއައި އެސިސްޓެންޓް.
      </p>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 thaana-text">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <BrainCircuit size={24} />
          </div>
          <h3 className="font-bold mb-2 thaana-text">ސްމާޓް އެސިސްޓެންޓް</h3>
          <p className="text-sm text-gray-500 thaana-text">އުނދަގޫ ސުވާލުތަކަށް ޖަވާބު ހޯދުމަށާއި ކަންކަމުގައި އެހީތެރިވެދޭނެ.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Languages size={24} />
          </div>
          <h3 className="font-bold mb-2 thaana-text">ދިވެހި ބަހަށް ހާއްސަ</h3>
          <p className="text-sm text-gray-500 thaana-text">ތާނަ އަކުރުން ލިޔުމަށާއި ދިވެހި ބަހުގެ ގަވާއިދުތަކަށް އަހުލުވެރި.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold mb-2 thaana-text">ސަގާފީ މައުލޫމާތު</h3>
          <p className="text-sm text-gray-500 thaana-text">ރާއްޖޭގެ ތާރީހާއި ސަގާފީ ކަންކަމުގެ ފުރިހަމަ މައުލޫމާތު ލިބޭނެ.</p>
        </div>
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
      <div className="flex-1 flex flex-col min-h-0">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          {currentSession && currentSession.messages.length > 0 ? (
            <div className="flex flex-col">
              {currentSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && !currentSession.messages[currentSession.messages.length - 1].isStreaming && (
                <div className="py-8 bg-gray-50 border-y border-gray-100">
                   <div className="max-w-3xl mx-auto px-4 flex gap-6">
                      <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white animate-pulse">
                        <Sparkles size={20} />
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>

        <div className="shrink-0 border-t bg-white/80 backdrop-blur-md">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
