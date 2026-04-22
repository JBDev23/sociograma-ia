// src/components/LayoutEditor/StudentsTab.tsx
import React, { useState } from "react";
import { Sparkles, Shuffle, Eraser, CheckCircle2 } from "lucide-react";

interface StudentsTabProps {
  savedDistributions: any[];
  projectActiveDistributionId: string;
  onApplyDistribution: (id: string) => void;
  unassignedStudents: string[];
  hasEnoughSeats: boolean;
  availableSeats: number;
  onRandomDistribute: () => void;
  onClearStudents: () => void;
  isBoardEmpty: boolean;
  isProcessingAI: boolean;
  onSmartRedistribute: () => void;
  seatedStudentsCount: number;
  forms: { id: string; title: string }[];
  selectedFormId: string;
  onFormChange: (id: string) => void;
}

export default function StudentsTab({
  savedDistributions,
  projectActiveDistributionId,
  onApplyDistribution,
  unassignedStudents,
  hasEnoughSeats,
  availableSeats,
  onRandomDistribute,
  onClearStudents,
  isBoardEmpty,
  isProcessingAI,
  onSmartRedistribute,
  seatedStudentsCount,
  forms,
  selectedFormId,
  onFormChange
}: StudentsTabProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(projectActiveDistributionId);

  const onDragStartStudent = (event: React.DragEvent, studentName: string) => {
    event.dataTransfer.setData("application/student", studentName);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Cargar Distribución */}
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col gap-4">
        <label className="text-[10px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-2">
          Plantillas
        </label>
        {savedDistributions.length === 0 ? (
          <p className="text-xs text-brand-slate font-medium">No hay distribuciones guardadas. Créalas en la pestaña de Sociogramas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <select 
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-brand-cream/30 border border-brand-slate/20 rounded-xl p-2.5 text-sm font-sans outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona una plantilla...</option>
              {savedDistributions.map((dist: any) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name} {projectActiveDistributionId === dist.id ? " (Activa)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => onApplyDistribution(selectedTemplateId)}
              disabled={!selectedTemplateId}
              className="w-full py-2.5 bg-brand-dark text-brand-cream rounded-xl font-semibold text-xs hover:bg-black disabled:opacity-40 transition-colors shadow-sm"
            >
              Aplicar al plano
            </button>
          </div>
        )}
      </div>

      {/* Controles de Alumnos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">Asignación Rápida</label>
          {!hasEnoughSeats && unassignedStudents.length > 0 && (
            <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Faltan {unassignedStudents.length - availableSeats} sillas
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRandomDistribute}
            disabled={unassignedStudents.length === 0 || !hasEnoughSeats}
            className="flex items-center justify-center gap-2 py-3 px-2 bg-white border border-brand-slate/20 text-brand-dark rounded-xl font-semibold text-xs hover:bg-brand-cream/50 disabled:opacity-40 transition-all shadow-sm"
          >
            <Shuffle size={14} className="text-brand-slate" /> Aleatorio
          </button>

          <button
            onClick={onClearStudents}
            disabled={seatedStudentsCount === 0}
            className="flex items-center justify-center gap-2 py-3 px-2 bg-white border border-brand-slate/20 text-brand-dark rounded-xl font-semibold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-40 transition-all shadow-sm group"
          >
            <Eraser size={14} className="text-brand-slate group-hover:text-red-500 transition-colors" /> Limpiar
          </button>

          {forms?.length > 0 && (
            <div className="flex flex-col gap-1.5 col-span-full mt-5">
              <label className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">Basado en encuesta:</label>
              <select 
                value={selectedFormId}
                onChange={(e) => onFormChange(e.target.value)}
                className="w-full bg-white border border-brand-orange/30 text-brand-dark text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer"
              >
                {forms.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>
          )}
            
          <button
            onClick={onSmartRedistribute}
            disabled={isProcessingAI || isBoardEmpty}
            className="flex items-center col-span-full justify-center gap-2 py-3.5 px-4 bg-brand-orange text-white rounded-xl font-semibold text-sm hover:bg-[#e66a17] disabled:opacity-50 transition-all shadow-md active:scale-[0.98] mt-1"
          >
            {isProcessingAI ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Auto-completar con IA
          </button>
        </div>
      </div>

      <hr className="border-brand-slate/10 my-1" />

      {/* Lista de Alumnos */}
      {unassignedStudents.length === 0 ? (
        <div className="p-8 bg-brand-cream/40 border border-brand-slate/15 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-brand-slate/10">
            <CheckCircle2 size={24} className="text-brand-dark" />
          </div>
          <h4 className="font-semibold text-brand-dark">Todos ubicados</h4>
          <p className="text-xs text-brand-slate">El plano está completo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-brand-slate leading-relaxed">
            Arrastra a un alumno a una mesa. Clica sobre uno ya sentado para retirarlo.
          </p>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 pb-4">
            {unassignedStudents.map((student) => (
              <div
                key={student}
                draggable
                onDragStart={(e) => onDragStartStudent(e, student)}
                className="p-3 bg-white border border-brand-slate/20 rounded-xl shadow-sm cursor-grab hover:border-brand-orange hover:ring-1 hover:ring-brand-orange transition-all active:cursor-grabbing flex items-center gap-3 group"
              >
                <div className="w-7 h-7 bg-brand-cream text-brand-dark font-mono font-bold rounded-lg flex items-center justify-center text-[11px] shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  {student.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-brand-dark truncate font-sans">
                  {student}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}