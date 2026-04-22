// app/page.tsx
import Link from "next/link";
import { 
  Users, 
  FolderKanban, 
  Network, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  Plus, 
  Lightbulb,
  ChevronRight
} from "lucide-react";
import { getDashboardStats } from "@/lib/api";
import QuickActions from "@/components/QuickActions";

export default async function DashboardPage() {

  const userId = "user-martinez";


  const { stats, recentProjects } = await getDashboardStats(userId);

  const statsWidgets = [
    { label: "Alumnos totales", value: stats.students, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Proyectos activos", value: stats.projects, icon: FolderKanban, color: "text-brand-orange", bg: "bg-brand-orange/10" },
    { label: "Sociogramas", value: stats.forms, icon: Network, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-8 max-w-400 mx-auto font-sans animate-in fade-in duration-700">
      
      {/* SECCIÓN DE BIENVENIDA */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-brand-dark tracking-tight">
          ¡Hola de nuevo, <span className="text-brand-orange">Profesor</span>! 👋
        </h1>
        <p className="text-brand-slate mt-3 text-lg font-medium">
          Esto es lo que ha pasado en tus clases desde tu última visita.
        </p>
      </section>

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statsWidgets.map((stat:any, i:any) => (
          <div 
            key={i} 
            className="bg-white p-6 rounded-4xl border border-brand-slate/15 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-brand-slate uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-brand-dark mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PROYECTOS RECIENTES */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-orange" />
              Proyectos Recientes
            </h2>
            <Link href="/projects" className="text-sm font-bold text-brand-orange hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project:any) => (
              <Link 
                key={project.id}
                href={`/projects/${project.id}/students`}
                className="group bg-white border border-brand-slate/15 rounded-3xl p-6 hover:border-brand-orange/40 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-brand-cream text-brand-dark rounded-xl flex items-center justify-center font-bold font-mono group-hover:bg-brand-orange group-hover:text-white transition-colors">
                    {project.title.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-brand-slate bg-brand-cream/50 px-2 py-1 rounded-lg">
                    {project.lastActivity}
                  </span>
                </div>
                <h3 className="font-bold text-brand-dark group-hover:text-brand-orange transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-brand-slate font-medium mt-1">
                  {project.members} alumnos analizados
                </p>
                <div className="mt-4 flex justify-end">
                  <div className="p-2 bg-brand-cream/50 rounded-full group-hover:bg-brand-orange/10 transition-colors">
                    <ArrowRight size={16} className="text-brand-orange" />
                  </div>
                </div>
              </Link>
            ))}

            {/* BOTÓN RÁPIDO: NUEVO PROYECTO */}
            <button className="border-2 border-dashed border-brand-slate/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-brand-slate hover:border-brand-orange hover:bg-brand-orange/5 hover:text-brand-orange transition-all group">
              <Link href="/projects/new" className="w-12 h-12 rounded-full bg-brand-slate/5 flex items-center justify-center group-hover:bg-brand-orange/10">
                <Plus size={20} strokeWidth={3} />
              </Link>
              <span className="font-bold text-sm">Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: INSIGHTS & ACCIONES */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 px-2">
            <Zap size={20} className="text-brand-orange" />
            Acciones Rápidas
          </h2>

          <QuickActions projects={recentProjects} />

          {/* TIP DE LA IA */}
          <div className="bg-linear-to-br from-brand-orange to-[#ff914d] p-6 rounded-4xl text-white shadow-xl shadow-brand-orange/20 relative overflow-hidden">
            <Lightbulb className="absolute -right-2 -bottom-2 w-24 h-24 opacity-20 rotate-12" />
            <h4 className="font-bold flex items-center gap-2 mb-3">
              <Sparkles size={18} />
              Tip del Día
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              "En grupos con baja cohesión, prueba a crear parejas de trabajo uniendo a un 'Líder Positivo' con un 'Alumno Aislado' para fomentar la integración natural."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icono extra para el tip
function Sparkles({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}