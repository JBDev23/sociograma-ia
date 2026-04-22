// app/s/[formId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { getPublicForm, submitSurvey } from "@/lib/api";
import { 
  UserCircle2, ThumbsDown, Briefcase, 
  Gamepad2, CheckCircle2, ChevronRight, ChevronLeft, Loader2 
} from "lucide-react";

export default function StudentSurveyPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);

  // Estados de datos
  const [form, setForm] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de flujo
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Respuestas del alumno
  const [studentId, setStudentId] = useState("");
  const [workAffinities, setWorkAffinities] = useState<string[]>([]);
  const [workConflicts, setWorkConflicts] = useState<string[]>([]);
  const [playAffinities, setPlayAffinities] = useState<string[]>([]);
  const [playConflicts, setPlayConflicts] = useState<string[]>([]);

  // MEJORA 1: Scroll hacia arriba automático al cambiar de paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getPublicForm(formId);
        if (data.status !== "ACTIVE") {
          setError("Esta encuesta está cerrada o aún no está disponible.");
          return;
        }
        setForm(data);
        const sortedMembers = (data.project?.members || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setMembers(sortedMembers);
      } catch (err) {
        setError("No se ha podido cargar la encuesta. Comprueba el enlace.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      // Si ya estaba, lo quitamos
      setList(list.filter(itemId => itemId !== id));
    } else {
      // Si no estaba y hay menos de 3, lo añadimos
      if (list.length < 3) setList([...list, id]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const responses: any[] = [];
    const addRels = (list: string[], type: string, context: string) => {
      list.forEach((toId, index) => {
        responses.push({ toId, type, context, weight: 3 - index });
      });
    };

    addRels(workAffinities, 'AFFINITY', 'WORK');
    addRels(workConflicts, 'CONFLICT', 'WORK');
    addRels(playAffinities, 'AFFINITY', 'PLAY');
    addRels(playConflicts, 'CONFLICT', 'PLAY');

    try {
      await submitSurvey(formId, { memberId: studentId, responses });
      setStep(5);
    } catch (err: any) {
      alert(err.message || "Error al enviar. Por favor, avisa a tu profesor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-brand-cream/20"><Loader2 size={40} className="animate-spin text-brand-orange" /></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-cream/20 text-center"><AlertBox message={error} /></div>;

  const availablePeers = members.filter(m => m.id !== studentId);

  const stepsConfig = [
    { id: 0 },
    { id: 1, title: "¿Con quién te gustaría TRABAJAR en equipo?", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50", state: workAffinities, setState: setWorkAffinities },
    { id: 2, title: "¿Con quién preferirías NO TRABAJAR en equipo?", icon: Briefcase, color: "text-red-500", bg: "bg-red-50", state: workConflicts, setState: setWorkConflicts },
    { id: 3, title: "¿Con quién te gustaría pasar tu TIEMPO LIBRE?", icon: Gamepad2, color: "text-emerald-500", bg: "bg-emerald-50", state: playAffinities, setState: setPlayAffinities },
    { id: 4, title: "¿Con quién preferirías NO PASAR tu tiempo libre?", icon: Gamepad2, color: "text-orange-500", bg: "bg-orange-50", state: playConflicts, setState: setPlayConflicts },
  ];

  const currentConfig = stepsConfig[step] as any;

  // MEJORA 2: Validación de mínimo 1
  const canGoNext = step > 0 && step < 5 && currentConfig?.state?.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      <header className="bg-white border-b border-brand-slate/10 py-4 px-6 sticky top-0 z-10 flex items-center justify-center shadow-sm">
        <h1 className="font-bold text-brand-dark text-center truncate max-w-xs">{form.title}</h1>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PASO 0: IDENTIFICACIÓN */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCircle2 size={40} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black text-brand-dark mb-2">¡Hola! 👋</h2>
              <p className="text-brand-slate font-medium text-sm">
                Selecciona tu nombre de la lista. Tus respuestas son <span className="font-bold text-brand-dark">confidenciales</span>.
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {members.map(member => (
                <button
                  key={member.id}
                  onClick={() => setStudentId(member.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                    studentId === member.id 
                      ? "border-brand-orange bg-brand-orange/5 text-brand-orange shadow-md" 
                      : "border-brand-slate/15 bg-white text-brand-dark hover:border-brand-orange/40"
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!studentId}
              className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-auto shadow-lg"
            >
              Comenzar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* PASOS 1 al 4: PREGUNTAS */}
        {step > 0 && step < 5 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentConfig.bg} ${currentConfig.color}`}>
                <currentConfig.icon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-brand-slate uppercase tracking-widest mb-1">
                  Pregunta {step} de 4
                </p>
                <div className="h-1.5 w-full bg-brand-slate/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-brand-dark mb-2">{currentConfig.title}</h2>
            <p className="text-sm font-medium text-brand-slate mb-6">
              Selecciona <span className="font-bold text-brand-dark">entre 1 y 3 compañeros</span>. El orden importa: el primero tiene más valor.
            </p>

            <div className="flex-1 space-y-2 pb-6">
              {availablePeers.map(peer => {
                const isSelected = currentConfig.state.includes(peer.id);
                const order = isSelected ? currentConfig.state.indexOf(peer.id) + 1 : null;
                
                // MEJORA 3: Textos explícitos para los pesos
                const orderLabel = order === 1 ? "1ª Opción" : order === 2 ? "2ª Opción" : "3ª Opción";
                
                return (
                  <button
                    key={peer.id}
                    onClick={() => toggleSelection(peer.id, currentConfig.state, currentConfig.setState)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSelected 
                        ? `border-current ${currentConfig.bg} ${currentConfig.color} shadow-sm` 
                        : "border-brand-slate/15 bg-white text-brand-dark hover:border-brand-slate/30"
                    }`}
                  >
                    <span className="font-bold text-left truncate pr-2">{peer.name}</span>
                    {isSelected && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold opacity-80 hidden sm:inline-block">
                          {orderLabel}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                          {order}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-brand-slate/10 bg-[#F8FAFC] sticky bottom-0 pb-6">
              <button 
                onClick={() => setStep(step - 1)}
                className="p-4 bg-white border border-brand-slate/20 text-brand-dark rounded-2xl hover:bg-brand-cream/50 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canGoNext}
                  className="flex-1 py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:hover:bg-brand-dark"
                >
                  Siguiente <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canGoNext || isSubmitting}
                  className="flex-1 py-4 bg-brand-orange text-white font-bold rounded-2xl hover:bg-[#e66a17] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:hover:bg-brand-orange"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "Enviar Respuestas"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* PASO 5: ÉXITO */}
        {step === 5 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-3">¡Misión Cumplida!</h2>
            <p className="text-brand-slate font-medium text-lg max-w-xs">
              Tus respuestas se han guardado correctamente. Ya puedes cerrar esta ventana.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function AlertBox({ message }: { message: string }) {
  return (
    <div className="bg-white border border-brand-slate/20 p-8 rounded-3xl shadow-xl max-w-sm w-full">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <ThumbsDown size={32} />
      </div>
      <h2 className="text-xl font-bold text-brand-dark mb-2">Ups...</h2>
      <p className="text-brand-slate text-sm">{message}</p>
    </div>
  );
}