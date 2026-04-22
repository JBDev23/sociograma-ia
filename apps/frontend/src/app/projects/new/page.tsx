// app/projects/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Sparkles, Loader2, BookOpen } from "lucide-react";
import { createProject } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);

    try {
      // Llamamos a nuestra API centralizada
      const newProject = await createProject({
        title: formData.title,
        description: formData.description,
        ownerId: "user-martinez", // Temporal: Hasta que conectes tu Auth
      });
      
      // Redirigimos directamente a la gestión de alumnos del nuevo proyecto
      router.push(`/projects/${newProject.id}/students`);
      
    } catch (error) {
      console.error(error);
      // Podrías usar tu sistema de Toasts aquí en lugar de un alert nativo
      alert("Hubo un problema al crear el proyecto. Revisa la conexión.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 flex flex-col items-center justify-center font-sans">
      
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* BOTÓN VOLVER */}
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-dark transition-colors mb-6 group"
        >
          <div className="p-1.5 bg-white border border-brand-slate/20 rounded-lg group-hover:border-brand-slate/40 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Volver a mis proyectos
        </Link>

        {/* TARJETA DEL FORMULARIO */}
        <div className="bg-white rounded-[2rem] border border-brand-slate/15 shadow-xl shadow-brand-slate/5 overflow-hidden relative">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="p-8 sm:p-10 relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center shadow-inner border border-brand-orange/20">
                <FolderKanban size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Crear Proyecto</h1>
                <p className="text-sm font-medium text-brand-slate mt-1">Configura un nuevo espacio para tu clase.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* CAMPO: TÍTULO */}
              <div className="flex flex-col gap-2.5">
                <label htmlFor="title" className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen size={14} />
                  Nombre de la Clase *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="Ej: 4º ESO - Grupo B"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isLoading}
                  autoFocus
                  className="w-full bg-brand-cream/30 border border-brand-slate/20 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 rounded-xl px-4 py-3.5 text-brand-dark text-sm font-semibold transition-all outline-none placeholder:text-brand-slate/50 placeholder:font-medium disabled:opacity-50"
                />
              </div>

              {/* CAMPO: DESCRIPCIÓN */}
              <div className="flex flex-col gap-2.5">
                <label htmlFor="description" className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  placeholder="Añade detalles sobre el objetivo sociométrico de este grupo..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                  className="w-full bg-brand-cream/30 border border-brand-slate/20 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 rounded-xl px-4 py-3.5 text-brand-dark text-sm font-medium transition-all outline-none placeholder:text-brand-slate/50 disabled:opacity-50 resize-none custom-scrollbar"
                />
              </div>

              <div className="h-px w-full bg-brand-slate/10 my-2" />

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/projects"
                  className="px-6 py-3.5 text-sm font-bold text-brand-slate hover:text-brand-dark hover:bg-brand-cream/50 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="flex items-center gap-2 px-8 py-3.5 bg-brand-dark text-white text-sm font-bold rounded-xl shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Proyecto"
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