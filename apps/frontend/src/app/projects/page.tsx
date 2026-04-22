// apps/frontend/src/app/projects/page.tsx
import { getProjects } from "@/lib/api";
import Link from "next/link";
import { FolderKanban, Plus, Users, Calendar, ArrowRight, MoreVertical } from "lucide-react";
import ProjectFilters from "@/components/ProjectFilters"; // Importamos nuestro cliente
import { ProjectWithDetails } from "@sociograma/shared";
import ProjectMenuButton from "@/components/ProjectMenuButton";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : undefined;

  const userId = "user-martinez"; // Sustituir por la sesión real
  
  // Fetch con los parámetros
  const projects: ProjectWithDetails[] = await getProjects(userId, q, sort);

  return (
    <div className="p-8 max-w-400 mx-auto font-sans animate-in fade-in duration-500">
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-brand-orange/10 rounded-2xl text-brand-orange shadow-sm border border-brand-orange/20">
              <FolderKanban size={28} strokeWidth={2.5} />
            </div>
            Mis Proyectos
          </h1>
          <p className="text-brand-slate mt-3 text-sm md:text-base font-medium">
            Gestiona tus clases, analiza sociogramas y diseña espacios de aprendizaje.
          </p>
        </div>

        <Link href="/projects/new" className="flex items-center justify-center gap-2.5 px-6 py-3 bg-brand-orange text-white font-bold rounded-2xl shadow-lg shadow-brand-orange/20 hover:bg-[#e66a17] transition-all active:scale-[0.98]">
          <Plus size={20} strokeWidth={3} />
          Nuevo Proyecto
        </Link>
      </div>

      {/* COMPONENTE INTERACTIVO DE FILTROS */}
      <ProjectFilters />

      {/* GRID DE PROYECTOS */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-brand-slate/20 rounded-4xl text-center">
          <div className="w-20 h-20 bg-brand-cream/50 rounded-full flex items-center justify-center mb-4">
            <FolderKanban size={40} className="text-brand-slate/40" />
          </div>
          <h3 className="text-xl font-bold text-brand-dark">No hay resultados</h3>
          <p className="text-brand-slate mt-2 max-w-xs leading-relaxed">
            {q ? `No se encontraron proyectos con el nombre "${q}".` : "Comienza creando tu primer proyecto para organizar a tus alumnos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project: ProjectWithDetails) => (
            // CAMBIO 1: La tarjeta ahora es un <div>, no un <Link>
            <div 
              key={project.id} 
              className="group bg-white border border-brand-slate/15 rounded-4xl p-6 shadow-sm hover:shadow-xl hover:border-brand-orange/30 transition-all flex flex-col relative overflow-hidden"
            >
              {/* CAMBIO 2: Truco CSS -> Un enlace invisible que cubre toda la tarjeta (z-0) */}
              <Link 
                href={`/projects/${project.id}/students`} 
                className="absolute inset-0 z-0" 
                aria-label={`Abrir proyecto ${project.title}`}
              />

              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/10 transition-colors" />

              {/* CABECERA DE LA TARJETA */}
              <div className="flex justify-between items-start mb-5 relative z-30">
                <div className="w-12 h-12 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center font-bold text-xl font-mono border border-brand-slate/10 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-colors pointer-events-none">
                  {project.title.charAt(0).toUpperCase()}
                </div>
                
                {/* El botón de menú */}
                <ProjectMenuButton projectId={project.id} projectName={project.title} />
              </div>

              {/* El resto de la tarjeta se queda igual, pero le ponemos pointer-events-none para que no interfieran con el clic */}
              <div className="relative z-10 pointer-events-none flex flex-col flex-1">
                <h2 className="text-lg font-bold text-brand-dark mb-1.5 group-hover:text-brand-orange transition-colors truncate">
                  {project.title}
                </h2>
                
                <p className="text-brand-slate text-[13px] font-medium line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {project.description || "Sin descripción asignada para este proyecto."}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-5 text-[11px] font-bold text-brand-slate/80 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-brand-orange" />
                      {project.members?.length || 0} Alumnos
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(project.updatedAt || project.createdAt).toLocaleDateString('es-ES', { 
                        month: 'short', year: 'numeric' 
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-brand-slate/10 w-full" />

                  <div className="flex items-center justify-between text-brand-orange font-bold text-sm">
                    <span>Abrir Espacio</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}