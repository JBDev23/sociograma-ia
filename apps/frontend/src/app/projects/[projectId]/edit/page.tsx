// apps/frontend/src/app/projects/[projectId]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Sparkles, Loader2, BookOpen } from "lucide-react";
import { getProjectData, updateProject } from "@/lib/api";

export default function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  // En Next.js 15+, params es una promesa en componentes de cliente
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Cargar los datos actuales al entrar a la página
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await getProjectData(projectId);
        setFormData({
          title: project.title || "",
          description: project.description || "",
        });
      } catch (error) {
        alert("No se pudo cargar la información del proyecto.");
        router.push("/projects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);

    try {
      await updateProject(projectId, {
        title: formData.title,
        description: formData.description,
      });
      
      // Volvemos a la lista de proyectos y refrescamos los datos
      router.push("/projects");
      router.refresh();
      
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al guardar los cambios.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-dark transition-colors mb-6 group"
        >
          <div className="p-1.5 bg-white border border-brand-slate/20 rounded-lg group-hover:border-brand-slate/40 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Cancelar edición
        </Link>

        <div className="bg-white rounded-4xl border border-brand-slate/15 shadow-xl shadow-brand-slate/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="p-8 sm:p-10 relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center shadow-inner border border-brand-slate/15">
                <Edit2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Editar Proyecto</h1>
                <p className="text-sm font-medium text-brand-slate mt-1">Modifica los datos de tu clase.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2.5">
                <label htmlFor="title" className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen size={14} />
                  Nombre de la Clase *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSaving}
                  className="w-full bg-brand-cream/30 border border-brand-slate/20 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 rounded-xl px-4 py-3.5 text-brand-dark text-sm font-semibold transition-all outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="description" className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSaving}
                  rows={3}
                  className="w-full bg-brand-cream/30 border border-brand-slate/20 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 rounded-xl px-4 py-3.5 text-brand-dark text-sm font-medium transition-all outline-none disabled:opacity-50 resize-none custom-scrollbar"
                />
              </div>

              <div className="h-px w-full bg-brand-slate/10 my-2" />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSaving || !formData.title.trim()}
                  className="flex items-center gap-2 px-8 py-3.5 bg-brand-dark text-white text-sm font-bold rounded-xl shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}