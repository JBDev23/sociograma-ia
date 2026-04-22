// src/components/SociometricReport.tsx
import { useMemo } from 'react';
import { ProjectWithDetails } from '@sociograma/shared';
import { BarChart3, Star, EyeOff, AlertTriangle, HeartCrack } from 'lucide-react';

interface SociometricReportProps {
  project: ProjectWithDetails;
  selectedFormId: string
}

export default function SociometricReport({ project, selectedFormId }: SociometricReportProps) {
  // Calculamos las estadísticas solo una vez, pero reaccionamos si cambia la encuesta (selectedFormId)
  const stats = useMemo(() => {
    const studentStats = project.members.map(member => ({
      id: member.id,
      name: member.name,
      inAffinity: 0,
      inConflict: 0,
    }));

    // 👇 FILTRO TEMPORAL CLAVE: Solo cogemos las relaciones de la encuesta actual
    const activeRelationships = project.relationships.filter(
      rel => selectedFormId === "" || rel.formId === selectedFormId
    );

    // Contamos las flechas entrantes (usando solo las filtradas)
    activeRelationships.forEach(rel => {
      const target = studentStats.find(s => s.id === rel.toId);
      if (target) {
        if (rel.type === 'AFFINITY') target.inAffinity += 1;
        if (rel.type === 'CONFLICT') target.inConflict += 1;
      }
    });

    // Clasificamos a los alumnos
    const sortedByAffinity = [...studentStats].sort((a, b) => b.inAffinity - a.inAffinity);
    const sortedByConflict = [...studentStats].sort((a, b) => b.inConflict - a.inConflict);

    return {
      // Líderes: Los 3 con más afinidad (que tengan al menos 2 votos)
      leaders: sortedByAffinity.filter(s => s.inAffinity >= 2).slice(0, 3),
      
      // En Riesgo: Los 3 con más conflictos recibidos
      atRisk: sortedByConflict.filter(s => s.inConflict >= 2).slice(0, 3),
      
      // Aislados: 0 afinidades recibidas y 0 conflictos recibidos (invisibles para el grupo)
      isolated: studentStats.filter(s => s.inAffinity === 0 && s.inConflict === 0),
      
      // Ignorados positivamente: Reciben conflictos, pero 0 afinidades
      ignored: studentStats.filter(s => s.inAffinity === 0 && s.inConflict > 0),
    };
  }, [project, selectedFormId]); // <--- AÑADIMOS selectedFormId A LAS DEPENDENCIAS DEL USEMEMO

  return (
    <div className="p-8 bg-white h-full overflow-y-auto custom-scrollbar font-sans">
      
      {/* CABECERA */}
      <div className="mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl border border-brand-orange/20 shadow-sm">
          <BarChart3 size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight">Informe Sociométrico</h2>
          <p className="text-sm text-brand-slate mt-1.5 font-medium">Análisis automatizado de la red de relaciones de la clase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA: LÍDERES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-slate/15 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2.5 mb-4">
            <Star size={20} className="text-emerald-500" /> Líderes Positivos
          </h3>
          {stats.leaders.length > 0 ? (
            <ul className="space-y-3">
              {stats.leaders.map(s => (
                <li key={s.id} className="flex justify-between items-center p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl transition-colors hover:bg-emerald-50">
                  <span className="font-semibold text-brand-dark text-sm">{s.name}</span>
                  <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {s.inAffinity} votos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-brand-cream/30 rounded-xl border border-brand-slate/10 text-center">
              <p className="text-sm text-brand-slate font-medium">No hay líderes claros en esta clase.</p>
            </div>
          )}
        </div>

        {/* TARJETA: AISLADOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-slate/15 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-slate/40"></div>
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2.5">
              <EyeOff size={20} className="text-brand-slate" /> Alumnos Aislados
            </h3>
            <p className="text-[11px] text-brand-slate font-medium mt-1.5 ml-8 leading-tight">Nadie los ha elegido ni para trabajar, ni para jugar, ni para conflictos.</p>
          </div>
          
          {stats.isolated.length > 0 ? (
            <ul className="space-y-2">
              {stats.isolated.map(s => (
                <li key={s.id} className="px-3 py-2.5 bg-brand-cream/30 border border-brand-slate/15 rounded-xl text-brand-dark text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-slate/40"></div>
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-brand-cream/30 rounded-xl border border-brand-slate/10 text-center">
              <p className="text-sm text-brand-slate font-medium">No hay alumnos completamente aislados.</p>
            </div>
          )}
        </div>

        {/* TARJETA: EN RIESGO / RECHAZADOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-slate/15 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2.5 mb-4">
            <AlertTriangle size={20} className="text-red-500" /> Focos de Conflicto
          </h3>
          {stats.atRisk.length > 0 ? (
            <ul className="space-y-3">
              {stats.atRisk.map(s => (
                <li key={s.id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl transition-colors hover:bg-red-50">
                  <span className="font-semibold text-brand-dark text-sm">{s.name}</span>
                  <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {s.inConflict} rechazos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-brand-cream/30 rounded-xl border border-brand-slate/10 text-center">
              <p className="text-sm text-brand-slate font-medium">No hay focos de rechazo en esta clase.</p>
            </div>
          )}
        </div>

        {/* TARJETA: IGNORADOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-slate/15 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2.5">
              <HeartCrack size={20} className="text-amber-500" /> Ignorados
            </h3>
            <p className="text-[11px] text-brand-slate font-medium mt-1.5 ml-8 leading-tight">No han recibido ninguna elección positiva, pero sí negativas.</p>
          </div>

          {stats.ignored.length > 0 ? (
            <ul className="space-y-2">
              {stats.ignored.map(s => (
                <li key={s.id} className="px-3 py-2.5 bg-amber-50/30 border border-amber-100 rounded-xl text-brand-dark text-sm font-semibold flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    {s.name}
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {s.inConflict} rechazos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-brand-cream/30 rounded-xl border border-brand-slate/10 text-center">
              <p className="text-sm text-brand-slate font-medium">No hay alumnos en esta situación.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}