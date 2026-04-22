// app/forms/[formId]/results/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { getFormResults } from "@/lib/api";
import Link from "next/link";
import { 
  ArrowLeft, BarChart2, CheckCircle2, Clock, 
  Users, AlertCircle, ExternalLink, Loader2 
} from "lucide-react";

export default function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultData = await getFormResults(formId);
        setData(resultData);
      } catch (err) {
        setError("No se pudieron cargar los resultados.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [formId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-brand-orange" /></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center text-brand-slate">{error}</div>;

  const totalMembers = data.project.members.length;
  const respondedIds = data.responses.map((r: any) => r.memberId);
  const respondedCount = respondedIds.length;
  const progress = totalMembers > 0 ? (respondedCount / totalMembers) * 100 : 0;

  // Clasificamos a los alumnos
  const respondedStudents = data.project.members.filter((m: any) => respondedIds.includes(m.id));
  const missingStudents = data.project.members.filter((m: any) => !respondedIds.includes(m.id));

  const isClosed = data.status === "CLOSED";

  return (
    <div className="p-8 max-w-300 mx-auto font-sans animate-in fade-in duration-500">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <Link href="/forms" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-dark transition-colors mb-8 group">
        <div className="p-1.5 bg-white border border-brand-slate/20 rounded-lg group-hover:border-brand-slate/40 transition-colors">
          <ArrowLeft size={16} />
        </div>
        Volver a Formularios
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* COLUMNA IZQ: RESUMEN Y ACCIONES */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Tarjeta Principal */}
          <div className="bg-white border border-brand-slate/15 rounded-4xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center shadow-inner">
                <BarChart2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark truncate">{data.title}</h1>
                <p className="text-sm text-brand-slate font-medium flex items-center gap-1.5 mt-1">
                  <Users size={14} /> {data.project.title}
                </p>
              </div>
            </div>

            <div className="p-6 bg-brand-cream/30 rounded-2xl border border-brand-slate/15 mb-8">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[11px] font-bold text-brand-slate uppercase tracking-widest mb-1">Participación</p>
                  <p className="text-3xl font-black text-brand-dark">
                    {respondedCount} <span className="text-lg text-brand-slate font-semibold">/ {totalMembers}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg ${isClosed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-orange/10 text-brand-orange'}`}>
                    {Math.round(progress)}% Completado
                  </span>
                </div>
              </div>
              <div className="h-3 w-full bg-brand-slate/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isClosed ? 'bg-emerald-500' : 'bg-brand-orange'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href={`/projects/${data.project.id}/sociograms`}
                className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/10"
              >
                Ir al Sociograma de la Clase <ExternalLink size={18} />
              </Link>
              
              {!isClosed && missingStudents.length > 0 && (
                <button 
                  onClick={() => alert("Puedes enviarles el enlace o proyectar el QR desde la pantalla principal.")}
                  className="w-full py-4 bg-white border border-brand-slate/20 text-brand-dark font-bold rounded-xl hover:bg-brand-cream/50 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={18} className="text-brand-orange" />
                  Recordar a los que faltan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DER: LISTA DE ALUMNOS */}
        <div className="w-full lg:w-112.5 bg-white border border-brand-slate/15 rounded-4xl p-6 shadow-sm flex flex-col h-150">
          <h3 className="text-lg font-bold text-brand-dark mb-4 px-2">Estado de los Alumnos</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            
            {/* Sección: Faltan por responder */}
            {missingStudents.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-brand-orange uppercase tracking-widest mb-3 px-2 flex items-center gap-1.5">
                  <Clock size={14} /> Pendientes ({missingStudents.length})
                </h4>
                <div className="space-y-1.5">
                  {missingStudents.map((m: any) => (
                    <div key={m.id} className="px-4 py-3 bg-red-50/30 border border-red-100 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm font-semibold text-brand-dark">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección: Ya han respondido */}
            {respondedStudents.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3 px-2 flex items-center gap-1.5 mt-2">
                  <CheckCircle2 size={14} /> Han respondido ({respondedStudents.length})
                </h4>
                <div className="space-y-1.5">
                  {respondedStudents.map((m: any) => {
                    const responseDate = data.responses.find((r: any) => r.memberId === m.id)?.createdAt;
                    return (
                      <div key={m.id} className="px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-sm font-semibold text-brand-dark">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-brand-slate font-medium">
                          {new Date(responseDate).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}