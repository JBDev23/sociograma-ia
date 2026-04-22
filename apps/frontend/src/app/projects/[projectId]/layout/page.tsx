// app/projects/[projectId]/layout/page.tsx
import LayoutEditor from "@/components/LayoutEditor/LayoutEditor";
import { getProjectData } from "@/lib/api";
import { Map, AlertCircle } from "lucide-react";

export default async function ProjectLayoutPage({ params }: { params: Promise<{ projectId: string }>}) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  // 1. Obtener los datos reales de la base de datos
  let project;
  try {
    project = await getProjectData(projectId);
  } catch (error) {
    // ESTADO DE ERROR REDISEÑADO
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-brand-slate/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={32} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">No se pudo cargar el plano</h2>
            <p className="text-sm text-brand-slate leading-relaxed">
              Ha habido un problema al intentar recuperar la información del proyecto <span className="font-mono text-xs bg-brand-cream px-1.5 py-0.5 rounded text-brand-dark">{projectId}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const realStudents = project?.members?.map((m: any) => m.name) || [];
  const availableForms = (project.forms || []).filter((f: any) => f.status !== "DRAFT");

  return (
    <div className="p-6 max-w-400 mx-auto min-h-screen font-sans">
      
      {/* HEADER REDISEÑADO */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-orange/10 rounded-2xl text-brand-orange shadow-sm border border-brand-orange/20">
              <Map size={28} strokeWidth={2.5} />
            </div>
            Diseño del Aula
          </h1>
          <p className="text-brand-slate mt-3 text-sm md:text-base font-medium">
            Configurando el espacio para el proyecto: <span className="font-bold text-brand-orange">{project.name || projectId}</span>
          </p>
        </div>
      </div>
      
      {/* Pasamos los alumnos reales al Editor */}
      <div className="animate-in fade-in duration-500 delay-150 fill-mode-both">
        <LayoutEditor 
          project={project}
          initialStudents={realStudents} 
          forms={availableForms}
        />
      </div>
    </div>
  );
}