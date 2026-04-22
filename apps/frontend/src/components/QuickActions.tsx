"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FolderKanban, Loader2, X, UploadCloud } from "lucide-react";
import { importMembersBulk } from "@/lib/api";

interface QuickActionsProps {
  projects: { id: string; title: string }[];
}

export default function QuickActions({ projects }: QuickActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSelectingProject, setIsSelectingProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      // Separamos por comas o saltos de línea y limpiamos
      const names = text
        .split(/[\r\n,]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (names.length === 0) {
        alert("El archivo CSV está vacío o no es válido.");
        setIsImporting(false);
        return;
      }

      try {
        await importMembersBulk(selectedProjectId, names);

        alert(`¡✅ Se han importado ${names.length} alumnos con éxito!`);
        setIsSelectingProject(false); 
        router.refresh(); 
      } catch (error) {
        alert("Error al importar alumnos. Revisa la consola.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Si no hay proyectos, le avisamos de que cree uno primero
  if (projects.length === 0) {
    return (
      <div className="p-4 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-2xl border border-brand-orange/20 text-center">
        Crea tu primer proyecto para desbloquear las acciones rápidas.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 relative">
      
      {/* MODO 1: BOTONES NORMALES */}
      {!isSelectingProject ? (
        <>
          <Link 
            href="/forms"
            className="w-full bg-brand-dark text-white p-4 rounded-2xl font-bold text-sm flex items-center justify-between hover:bg-black transition-colors shadow-md shadow-brand-dark/10 group"
          >
            Nuevo Formulario
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          </Link>
          
          <button 
            onClick={() => setIsSelectingProject(true)}
            className="w-full bg-white border border-brand-slate/15 text-brand-dark p-4 rounded-2xl font-bold text-sm flex items-center justify-between hover:bg-brand-cream/30 transition-colors group"
          >
            Importar Alumnos (CSV)
            <FolderKanban size={18} className="text-brand-slate group-hover:text-brand-dark transition-colors" />
          </button>
        </>
      ) : (
        /* MODO 2: SELECTOR DE PROYECTO PARA IMPORTAR */
        <div className="bg-white border border-brand-orange/30 p-4 rounded-2xl shadow-lg shadow-brand-orange/5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-brand-orange uppercase tracking-widest flex items-center gap-1.5">
              <UploadCloud size={14} /> Destino del CSV
            </span>
            <button onClick={() => setIsSelectingProject(false)} className="text-brand-slate hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={isImporting}
            className="w-full bg-brand-cream/30 border border-brand-slate/20 text-brand-dark text-sm font-semibold rounded-xl px-3 py-2.5 mb-3 outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting || !selectedProjectId}
            className="w-full py-2.5 bg-brand-dark text-white font-bold rounded-xl text-sm hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isImporting ? <Loader2 size={16} className="animate-spin" /> : "Seleccionar Archivo .CSV"}
          </button>
        </div>
      )}
    </div>
  );
}