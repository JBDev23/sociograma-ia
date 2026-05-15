// src/components/AiAssistant.tsx
'use client';

import { getAiGroupProposal } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import { Bot, Sparkles, Layout, Send, Users, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedGroups?: { groupName: string; members: string[] }[];
  isError?: boolean;
}

interface AiAssistantProps {
  projectId: string;
  onApplyGroups: (groups: any) => void;
  selectedFormId: string;
}

export default function AiAssistant({ projectId, onApplyGroups, selectedFormId }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente sociométrico. He analizado las relaciones de la clase. ¿Cómo quieres que agrupe a los alumnos? (Ej: "Haz 4 grupos equilibrados", "Separa a los líderes").'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [numGroups, setNumGroups] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await getAiGroupProposal(projectId, input, numGroups > 0 ? numGroups : undefined, selectedFormId);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation,
        suggestedGroups: data.suggestedGroups
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      let errorMessage = 'No he podido conectar con el servidor. Por favor, inténtalo de nuevo.';
      console.log(error)
      
      if (error.message === "LIMITE_IA_ALCANZADO") {
        errorMessage = "Has superado el límite de 2 análisis de IA por día. ¡Vuelve mañana!";
      }

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: errorMessage,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-brand-slate/20 rounded-3xl shadow-sm overflow-hidden font-sans">
      
      {/* Cabecera */}
      <div className="bg-white border-b border-brand-slate/15 px-5 py-4 flex items-center gap-3 z-10 shrink-0">
        <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
          <Sparkles size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="font-bold text-brand-dark text-sm leading-tight">Asistente IA</h2>
          <p className="text-[11px] text-brand-slate font-medium">Análisis y Distribución</p>
        </div>
      </div>

      {/* Historial de Chat */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-brand-cream/20 custom-scrollbar relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-brand-dark text-white rounded-tr-sm' 
                : msg.isError 
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm flex gap-2 items-start'
                  : 'bg-white text-brand-dark border border-brand-slate/15 rounded-tl-sm'
            }`}>
              {msg.isError && <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <p>{msg.content}</p>
            </div>
            
            {/* Tarjeta de Aplicación de Grupos */}
            {msg.suggestedGroups && (
              <div className="mt-3 w-full max-w-[85%] bg-white border border-brand-orange/20 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-brand-orange/10 p-1.5 rounded-lg text-brand-orange">
                    <Layout size={16} />
                  </div>
                  <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">Nueva Distribución</p>
                </div>
                <button 
                  onClick={() => onApplyGroups(msg.suggestedGroups)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-[#e66a17] text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  <Bot size={16} />
                  Aplicar al Sociograma
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Indicador de Carga */}
        {isLoading && (
          <div className="flex items-start animate-in fade-in duration-200">
            <div className="bg-white border border-brand-slate/15 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex gap-1.5 items-center h-11">
              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input */}
      <div className="p-4 bg-white border-t border-brand-slate/15 z-10 flex flex-col gap-3 shrink-0">
        
        {/* Selector de Grupos */}
        <div className="flex items-center gap-2.5 px-1">
          <Users size={14} className="text-brand-slate" />
          <select 
            value={numGroups} 
            onChange={(e) => setNumGroups(Number(e.target.value))}
            className="text-xs bg-brand-cream/40 border border-brand-slate/20 text-brand-dark font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all cursor-pointer appearance-none pr-6 relative"
            disabled={isLoading}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23546877' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6-6H0z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '8px'
            }}
          >
            <option value={0}>Auto (IA decide)</option>
            <option value={2}>2 Grupos</option>
            <option value={3}>3 Grupos</option>
            <option value={4}>4 Grupos</option>
            <option value={5}>5 Grupos</option>
            <option value={6}>6 Grupos</option>
          </select>
        </div>

        {/* Input de Texto */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ej: Mezcla a los líderes con los aislados..."
            className="w-full bg-brand-cream/30 border border-brand-slate/20 focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-xl pl-4 pr-12 py-3 text-sm transition-all text-brand-dark outline-none placeholder:text-brand-slate/60 font-medium"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 aspect-square h-[calc(100%-12px)] bg-brand-dark text-white rounded-lg flex items-center justify-center hover:bg-black disabled:opacity-50 disabled:hover:bg-brand-dark transition-all"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}