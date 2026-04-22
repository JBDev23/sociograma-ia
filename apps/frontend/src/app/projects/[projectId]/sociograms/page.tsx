import { getProjectData } from '@/lib/api';
import { transformProjectToFlow } from '@/lib/flow-utils';
import ProjectWorkspace from '@/components/ProjectWorkspace';
import { FolderKanban, AlertCircle } from 'lucide-react';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  try {
    const resolvedParams = await params; 
    const project = await getProjectData(resolvedParams.projectId);
    const { nodes, edges } = transformProjectToFlow(project);

    return (
      <main className="min-h-screen p-6 max-w-400 mx-auto font-sans">
        
        {/* Cabecera estática (SEO amigable) */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-brand-orange/10 rounded-2xl text-brand-orange shadow-sm border border-brand-orange/20">
                <FolderKanban size={28} strokeWidth={2.5} />
              </div>
              {project.title || "Espacio de Trabajo"}
            </h1>
            {project.description && (
              <p className="text-brand-slate mt-3 text-sm md:text-base font-medium">
                {project.description}
              </p>
            )}
          </div>
        </header>

        {/* Pasamos los datos al componente interactivo */}
        <div className="animate-in fade-in duration-500 delay-150 fill-mode-both">
          <ProjectWorkspace project={project} initialNodes={nodes} initialEdges={edges} />
        </div>
        
      </main>
    );
  } catch (error) {
    // ESTADO DE ERROR REDISEÑADO
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-brand-slate/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle size={32} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">Proyecto no encontrado</h2>
            <p className="text-sm text-brand-slate leading-relaxed">
              No hemos podido cargar la información de este proyecto o ha habido un problema de conexión con el servidor.
            </p>
          </div>
        </div>
      </div>
    );
  }
}