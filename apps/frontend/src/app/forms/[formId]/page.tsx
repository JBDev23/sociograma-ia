// app/forms/[formId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFormById, updateForm } from "@/lib/api";
import Link from "next/link";
import { 
  ArrowLeft, Settings, Calendar, Play, CheckCircle2, 
  Copy, Check, Loader2, Link as LinkIcon 
} from "lucide-react";

export default function FormSettingsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados del formulario editable
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(formId);
        setForm(data);
        // Si ya tenía fecha, la formateamos para el input type="date" (YYYY-MM-DD)
        if (data.deadline) {
          setDeadline(new Date(data.deadline).toISOString().split('T')[0]);
        }
      } catch (error) {
        alert("Error cargando el formulario");
        router.push("/forms");
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [formId, router]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await updateForm(formId, {
        deadline: deadline || null
      });
      setForm(updated);
      alert("Ajustes guardados correctamente");
    } catch (error) {
      alert("Error al guardar ajustes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm("Al publicar la encuesta, los alumnos podrán empezar a contestar. ¿Continuar?")) return;
    setIsSaving(true);
    try {
      const updated = await updateForm(formId, { status: "ACTIVE" });
      setForm(updated);
    } catch (error) {
      alert("Error al activar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async () => {
    if (!confirm("Si cierras la encuesta, nadie más podrá enviar respuestas. ¿Continuar?")) return;
    setIsSaving(true);
    try {
      const updated = await updateForm(formId, { status: "CLOSED" });
      setForm(updated);
    } catch (error) {
      alert("Error al cerrar");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    // Generamos la URL mágica para el alumno
    const url = `${window.location.origin}/s/${formId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-brand-orange" /></div>;
  }

  const isDraft = form.status === "DRAFT";
  const isActive = form.status === "ACTIVE";
  const isClosed = form.status === "CLOSED";

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
        
        {/* COLUMNA IZQ: AJUSTES (Settings) */}
        <div className="flex-1 w-full bg-white border border-brand-slate/15 rounded-4xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center shadow-inner">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark truncate">{form.title}</h1>
              <p className="text-sm text-brand-slate font-medium">Configuración de la encuesta</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={14} /> Fecha Límite
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isClosed || isSaving}
                className="w-full bg-brand-cream/30 border border-brand-slate/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-1 transition-all disabled:opacity-50"
              />
              <p className="text-xs text-brand-slate font-medium">
                Opcional. Si lo dejas vacío, deberás cerrar la encuesta manualmente.
              </p>
            </div>

            {/* Aquí añadiríamos reglas futuras (Ej: Preguntar por Afinidad/Conflicto, etc.) */}
            <div className="p-4 bg-brand-cream/30 border border-brand-slate/15 rounded-xl">
              <p className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                Sociometría Estándar Activa
              </p>
              <p className="text-xs text-brand-slate mt-1">
                Los alumnos elegirán a 3 compañeros para trabajar y 3 para ocio.
              </p>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving || isClosed}
              className="px-6 py-3 bg-brand-cream text-brand-dark font-bold rounded-xl hover:bg-brand-orange hover:text-white transition-all disabled:opacity-50 w-full md:w-auto"
            >
              Guardar Ajustes
            </button>
          </div>
        </div>

        {/* COLUMNA DER: ESTADO Y PUBLICACIÓN */}
        <div className="w-full lg:w-100 flex flex-col gap-6">
          
          {/* Tarjeta de Publicación */}
          <div className="bg-white border border-brand-slate/15 rounded-4xl p-6 shadow-xl shadow-brand-slate/5 overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isDraft ? 'bg-brand-slate' : isActive ? 'bg-brand-orange' : 'bg-emerald-500'}`} />
            
            <h3 className="text-lg font-bold text-brand-dark mb-2 mt-2">Estado: {isDraft ? "Borrador" : isActive ? "Activo" : "Finalizado"}</h3>
            
            {isDraft && (
              <>
                <p className="text-sm text-brand-slate mb-6">
                  Esta encuesta no es visible para los alumnos. Revísala y publícala cuando esté lista.
                </p>
                <button 
                  onClick={handleActivate}
                  disabled={isSaving}
                  className="w-full py-4 bg-brand-orange text-white font-bold rounded-xl hover:bg-[#e66a17] transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-orange/20"
                >
                  <Play size={18} className="fill-current" />
                  Publicar Encuesta
                </button>
              </>
            )}

            {isActive && (
              <>
                <p className="text-sm text-brand-slate mb-4">
                  Comparte este enlace con los alumnos de la clase para que puedan participar.
                </p>
                
                <div className="flex items-center gap-2 p-2 bg-brand-cream/50 border border-brand-slate/20 rounded-xl mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg text-brand-slate">
                    <LinkIcon size={16} />
                  </div>
                  <input 
                    readOnly 
                    value={`${window.location.origin}/s/${formId}`}
                    className="flex-1 bg-transparent text-xs font-mono text-brand-dark outline-none cursor-copy"
                    onClick={copyToClipboard}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    {copied ? "¡Enlace Copiado!" : "Copiar Enlace"}
                  </button>

                  <button 
                    onClick={handleClose}
                    disabled={isSaving}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all"
                  >
                    Cerrar Encuesta
                  </button>
                </div>
              </>
            )}

            {isClosed && (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-sm text-brand-slate font-medium">
                  El periodo de respuestas ha finalizado. Ya puedes analizar el sociograma.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}