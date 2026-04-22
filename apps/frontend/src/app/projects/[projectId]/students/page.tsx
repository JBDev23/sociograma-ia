// app/projects/[projectId]/students/page.tsx
"use client";

import { use, useEffect, useState, useRef } from "react";
import { getProjectData, addMember, deleteMember, importMembersBulk } from "@/lib/api";
import { Users, UserPlus, AlertCircle, UserX, Trash2, Loader2, UploadCloud } from "lucide-react";
import { Member } from "@sociograma/shared";

export default function ProjectStudentsPage({ 
  params 
}: { 
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params);

  const [project, setProject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Estados para las interacciones
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 👇 NUEVOS ESTADOS PARA EL CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectData(projectId);
      setProject(data);
      const sortedMembers = (data?.members || []).sort((a: Member, b: any) => a.name.localeCompare(b.name));
      setStudents(sortedMembers);
    } catch (error) {
      console.error("Error al cargar los alumnos:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
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
        await importMembersBulk(projectId, names);
        alert(`¡✅ Se han importado ${names.length} alumnos con éxito!`);
        await loadData(); // <-- Recargamos la lista automáticamente
      } catch (error) {
        alert("Error al importar alumnos. Revisa la consola.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // 1. Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProjectData(projectId);
        setProject(data);
        // Ordenamos los alumnos alfabéticamente al cargar
        const sortedMembers = (data?.members || []).sort((a: Member, b: any) => a.name.localeCompare(b.name));
        setStudents(sortedMembers);
      } catch (error) {
        console.error("Error al cargar los alumnos:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // 2. Función para añadir alumno
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isAdding) return;
    
    setIsAdding(true);
    try {
      const created = await addMember(projectId, newName.trim());
      // Añadimos y volvemos a ordenar
      setStudents(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (e) {
      alert("Error al añadir alumno. Revisa la conexión.");
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Función para borrar alumno
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Borrar a ${name}? Se eliminarán todas sus respuestas y relaciones.`)) return;
    
    setDeletingId(id);
    try {
      await deleteMember(id);
      setStudents(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert("Error al borrar el alumno.");
    } finally {
      setDeletingId(null);
    }
  };

  // ESTADO: CARGANDO
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 size={40} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  // ESTADO: ERROR
  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-brand-slate/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={32} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">Error de conexión</h2>
            <p className="text-sm text-brand-slate leading-relaxed">
              No se ha podido cargar la información de los alumnos para el proyecto <span className="font-mono text-xs bg-brand-cream px-1.5 py-0.5 rounded text-brand-dark">{projectId}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-400 mx-auto min-h-screen font-sans">

{/* HEADER CON FORMULARIO INTEGRADO */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6 animate-in slide-in-from-top-4 fade-in duration-300">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-orange/10 rounded-2xl text-brand-orange shadow-sm border border-brand-orange/20">
              <Users size={28} strokeWidth={2.5} />
            </div>
            Gestión de Alumnos
          </h1>
          <p className="text-brand-slate mt-3 text-sm md:text-base font-medium">
            Proyecto: <span className="font-bold text-brand-orange">{project?.title || projectId}</span> ({students.length})
          </p>
        </div>
        
        {/* ZONA DE ACCIONES (Importar + Añadir manual) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
          {/* BOTÓN DE IMPORTAR CSV */}
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full sm:w-auto px-5 py-3 bg-white border border-brand-slate/20 text-brand-dark font-bold rounded-xl shadow-sm hover:bg-brand-cream/50 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shrink-0"
          >
            {isImporting ? <Loader2 size={18} className="animate-spin text-brand-slate" /> : <UploadCloud size={18} className="text-brand-slate" />}
            <span className="hidden sm:inline">Importar CSV</span>
          </button>

          {/* INPUT DE AÑADIR ALUMNO */}
          <form onSubmit={handleAdd} className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Nombre del alumno..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 sm:w-64 px-4 py-3 bg-white border border-brand-slate/20 rounded-xl text-sm font-semibold outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder:font-medium"
              disabled={isAdding || isImporting}
            />
            <button 
              type="submit"
              disabled={isAdding || !newName.trim() || isImporting}
              className="px-5 py-3 bg-brand-dark text-white font-bold rounded-xl shadow-md hover:bg-black transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shrink-0"
            >
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              <span className="hidden sm:inline">Añadir</span>
            </button>
          </form>
        </div>
      </div>
      
      {/* CONTENIDO (GRID O EMPTY STATE) */}
      <div className="animate-in fade-in duration-500 delay-150 fill-mode-both">
        {students.length === 0 ? (
          <div className="p-12 text-center bg-white border border-brand-slate/15 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-brand-cream/50 rounded-full flex items-center justify-center border border-brand-slate/10">
              <UserX size={32} className="text-brand-slate" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Sin alumnos</h3>
              <p className="text-brand-slate text-sm mt-1">Aún no has añadido a nadie a este proyecto. Empieza escribiendo un nombre arriba.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {students.map((member: any) => (
              <div 
                key={member.id} 
                className="bg-white p-4 pr-12 rounded-2xl border border-brand-slate/15 shadow-sm hover:shadow-md hover:border-brand-orange/40 transition-all flex items-center gap-4 group cursor-default relative overflow-hidden"
              >
                <div className="w-11 h-11 bg-brand-cream text-brand-dark font-mono font-bold rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-brand-dark truncate font-sans text-sm">{member.name}</p>
                  <p className="text-[11px] text-brand-slate font-mono truncate mt-0.5">
                    ID: <span title={member.id}>{member.id.substring(0, 8)}...</span>
                  </p>
                </div>

                {/* BOTÓN DE BORRAR (Aparece en Hover) */}
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  disabled={deletingId === member.id}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-brand-slate opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-100"
                  title={`Eliminar a ${member.name}`}
                >
                  {deletingId === member.id ? (
                    <Loader2 size={16} className="animate-spin text-red-500" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}