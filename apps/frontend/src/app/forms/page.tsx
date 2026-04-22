// app/forms/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllForms, createForm, deleteForm, getProjects } from "@/lib/api";
import FormFilters from "@/components/FormFilters";
import QRCode from "react-qr-code"; // <-- NUEVA IMPORTACIÓN
import { 
  FileText, Plus, Send, ClipboardCheck, Users, Clock, 
  MoreVertical, BarChart2, Loader2, Trash2, CheckCircle2, 
  Play, FolderKanban, X, Copy, Check
} from "lucide-react";
import Link from "next/link";

function FormsPageContent() {
  const userId = "user-martinez";
  const searchParams = useSearchParams();
  
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";

  const [forms, setForms] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Estados para creación
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS PARA EL MODAL DEL QR ---
  const [qrModalForm, setQrModalForm] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [q, sort]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [formsData, projectsData] = await Promise.all([
        getAllForms(userId, q, sort),
        getProjects(userId)
      ]);
      setForms(formsData);
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedProjectId) return;

    setIsSubmitting(true);
    try {
      await createForm({ title: newTitle, projectId: selectedProjectId });
      setNewTitle("");
      setIsCreating(false);
      await loadData();
    } catch (error) {
      alert("Error al crear el formulario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar la encuesta "${title}"?`)) return;
    try {
      await deleteForm(id);
      setForms(prev => prev.filter(f => f.id !== id));
      setOpenMenuId(null);
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // Función para copiar el link desde el modal
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-400 mx-auto font-sans animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-orange/10 rounded-2xl text-brand-orange shadow-sm border border-brand-orange/20">
              <FileText size={28} strokeWidth={2.5} />
            </div>
            Gestión de Formularios
          </h1>
          <p className="text-brand-slate mt-3 text-sm md:text-base font-medium">
            Crea y distribuye encuestas sociométricas para tus alumnos.
          </p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          disabled={projects.length === 0}
          className="flex items-center justify-center gap-2.5 px-6 py-3 bg-brand-orange text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/20 hover:bg-[#e66a17] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          <Plus size={20} strokeWidth={3} className={isCreating ? "rotate-45 transition-transform" : "transition-transform"} />
          {isCreating ? "Cancelar" : "Nuevo Formulario"}
        </button>
      </div>

      {projects.length === 0 && (
        <div className="mb-8 p-4 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl font-medium text-sm flex items-center gap-3">
          <FolderKanban size={18} />
          Crea al menos un Proyecto desde la pestaña "Proyectos" antes de hacer formularios.
        </div>
      )}

      {isCreating && (
        <div className="bg-white p-6 rounded-4xl border border-brand-orange/30 shadow-lg shadow-brand-orange/5 mb-8 animate-in slide-in-from-top-4">
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-2">
              <label className="text-[11px] font-bold text-brand-slate uppercase tracking-widest">Título de la encuesta</label>
              <input
                type="text" autoFocus placeholder="Ej: Sociometría - 2º ESO B"
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-brand-cream/30 border border-brand-slate/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-1 transition-all"
              />
            </div>
            <div className="flex-1 w-full flex flex-col gap-2">
              <label className="text-[11px] font-bold text-brand-slate uppercase tracking-widest">Asignar al Proyecto</label>
              <select
                value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white border border-brand-slate/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-1 transition-all appearance-none cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" disabled={!newTitle.trim() || !selectedProjectId || isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 flex justify-center"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Crear Borrador"}
            </button>
          </form>
        </div>
      )}

      <FormFilters />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-brand-orange/50" />
        </div>
      ) : forms.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-brand-slate/20 rounded-4xl text-center">
          <div className="w-20 h-20 bg-brand-cream/50 rounded-full flex items-center justify-center mb-4 text-brand-slate/30">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-brand-dark">No hay resultados</h3>
          <p className="text-brand-slate mt-2 max-w-xs leading-relaxed">
            {q ? `No se encontraron encuestas con la palabra "${q}".` : "Las encuestas te permiten recopilar las preferencias de los alumnos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {forms.map((form) => {
            const responses = form.responsesCount || 0;
            const total = form.totalMembers || 0;
            const progress = total > 0 ? (responses / total) * 100 : 0;
            const isDraft = form.status === "DRAFT";
            const isDone = form.status === "CLOSED";
            const statusLabel = isDone ? "Finalizado" : isDraft ? "Borrador" : "Activo";

            return (
              <div key={form.id} className="group bg-white border border-brand-slate/15 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6 relative">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isDone ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      isDraft ? "bg-brand-slate/10 text-brand-slate" : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                    }`}>
                      {statusLabel}
                    </span>
                    <span className="text-[11px] font-mono text-brand-slate">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-orange transition-colors truncate">
                    {form.title}
                  </h3>
                  <p className="text-xs text-brand-slate font-medium mt-1 flex items-center gap-1.5">
                    <ClipboardCheck size={14} /> {form.projectTitle || "Sin proyecto"}
                  </p>
                </div>

                <div className="w-full md:w-64 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                      <Users size={14} /> Participación
                    </span>
                    <span className="text-xs font-black text-brand-dark">{responses} / {total}</span>
                  </div>
                  <div className="h-2 w-full bg-brand-cream rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${isDone ? 'bg-emerald-500' : 'bg-brand-orange'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="hidden lg:flex flex-col gap-1 w-32">
                  <span className="text-[10px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> Límite
                  </span>
                  <span className="text-sm font-bold text-brand-dark">
                    {form.deadline ? new Date(form.deadline).toLocaleDateString() : "Sin fecha"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 relative">
                  {!isDraft && (
                    <Link 
                      href={`/forms/${form.id}/results`}
                      className="p-2.5 text-brand-orange bg-brand-orange/5 hover:bg-brand-orange hover:text-white rounded-xl transition-all border border-brand-orange/10 shadow-sm flex items-center justify-center" 
                      title="Ver Resultados"
                    >
                      <BarChart2 size={18} />
                    </Link>
                  )}
                  
                  {/* BOTÓN DEL AVIONCITO -> ABRE MODAL */}
                  <button 
                    onClick={() => setQrModalForm(form)}
                    disabled={isDraft} 
                    className="p-2.5 text-brand-slate bg-brand-cream/50 hover:bg-brand-dark hover:text-white rounded-xl transition-all disabled:opacity-40"
                    title="Compartir Encuesta (QR)"
                  >
                    <Send size={18} />
                  </button>
                  
                  <div className="w-px h-8 bg-brand-slate/10 mx-1 hidden md:block" />
                  
                  <div className="relative">
                    <button onClick={() => setOpenMenuId(openMenuId === form.id ? null : form.id)} className={`p-2 rounded-xl transition-colors ${openMenuId === form.id ? 'bg-brand-cream text-brand-dark' : 'text-brand-slate hover:text-brand-dark hover:bg-brand-cream/50'}`}>
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === form.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-slate/15 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                        <Link 
                          href={`/forms/${form.id}`} 
                          className="w-full block text-left px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-cream/50 transition-colors"
                        >
                          Editar Ajustes
                        </Link>
                        <div className="h-px w-full bg-brand-slate/10" />
                        <button onClick={() => handleDelete(form.id, form.title)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- OVERLAY MODAL DEL QR --- */}
      {qrModalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro desenfocado */}
          <div 
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setQrModalForm(null)}
          />
          
          {/* Caja Blanca del Modal */}
          <div className="relative bg-white border border-brand-slate/15 rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-300">
            <button 
              onClick={() => setQrModalForm(null)}
              className="absolute top-6 right-6 p-2 text-brand-slate hover:bg-brand-cream hover:text-brand-dark rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center mb-4">
              <Send size={32} />
            </div>

            <h3 className="text-xl font-bold text-brand-dark mb-1">{qrModalForm.title}</h3>
            <p className="text-sm font-medium text-brand-slate mb-8">Proyecta este QR en la pizarra para tus alumnos.</p>

            <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-brand-cream/50 mb-8 inline-block">
              {/* COMPONENTE DEL QR */}
              <QRCode 
                value={`${window.location.origin}/s/${qrModalForm.id}`} 
                size={220}
                level="H" // Alta corrección de errores para que se lea fácil de lejos
                fgColor="#1C2127" // Tu color brand-dark
              />
            </div>

            <div className="w-full h-px bg-brand-slate/10 mb-6" />

            <button 
              onClick={() => handleCopyLink(`${window.location.origin}/s/${qrModalForm.id}`)}
              className="w-full py-4 bg-brand-cream/50 text-brand-dark font-bold rounded-2xl hover:bg-brand-cream transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
              {copied ? "¡Enlace copiado!" : "Copiar Enlace Manualmente"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function FormsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 size={40} className="animate-spin text-brand-orange" /></div>}>
      <FormsPageContent />
    </Suspense>
  );
} 