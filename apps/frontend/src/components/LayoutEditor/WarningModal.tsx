// src/components/LayoutEditor/WarningModal.tsx
import React from "react";
import { TriangleAlert } from "lucide-react";

interface WarningModalProps {
  warningMessages: string[];
  pendingTemplateId: string | null;
  pendingRedistribute: { config: any[]; missing: number } | null;
  onClose: () => void;
  onContinueTemplate: () => void;
  onAutoCreateTemplate: () => void;
  onContinueRedistribute: () => void;
  onAutoTablesRedistribute: () => void;
}

export default function WarningModal({
  warningMessages,
  pendingTemplateId,
  pendingRedistribute,
  onClose,
  onContinueTemplate,
  onAutoCreateTemplate,
  onContinueRedistribute,
  onAutoTablesRedistribute,
}: WarningModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-md">
      <div className="bg-brand-cream rounded-2xl shadow-2xl max-w-2xl w-full p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 border border-brand-slate/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center shrink-0">
            <TriangleAlert size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-dark font-sans">Ajustes de espacio necesarios</h3>
            <p className="text-sm text-brand-slate mt-1">Hemos detectado algunas inconsistencias en el plano.</p>
          </div>
        </div>

        <ul className="text-sm text-brand-dark bg-white border border-brand-slate/20 p-5 rounded-xl flex flex-col gap-3 max-h-40 overflow-y-auto font-mono">
          {warningMessages.map((msg, i) => (
            <li key={i} className="flex gap-3 leading-relaxed items-start">
              <span className="text-brand-orange mt-0.5">•</span> {msg}
            </li>
          ))}
        </ul>

        <p className="text-sm text-brand-slate font-medium">
          Los alumnos que no tengan asiento se quedarán en la lista lateral para que los ubiques manualmente. ¿Cómo deseas proceder?
        </p>

        <div className="flex flex-wrap justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-semibold text-brand-slate hover:text-brand-dark hover:bg-brand-slate/10 rounded-xl transition-colors text-sm"
          >
            Cancelar
          </button>

          {pendingTemplateId && (
            <>
              <button
                onClick={onContinueTemplate}
                className="px-5 py-2.5 font-semibold bg-white border border-brand-slate/20 text-brand-dark hover:bg-gray-50 rounded-xl transition-colors text-sm shadow-sm"
              >
                Forzar distribución
              </button>
              <button
                onClick={onAutoCreateTemplate}
                className="px-5 py-2.5 font-semibold bg-brand-dark text-white hover:bg-black rounded-xl transition-colors text-sm shadow-md"
              >
                Generar plano ideal
              </button>
            </>
          )}

          {pendingRedistribute && (
            <>
              <button
                onClick={onContinueRedistribute}
                className="px-5 py-2.5 font-semibold bg-white border border-brand-slate/20 text-brand-dark hover:bg-gray-50 rounded-xl transition-colors text-sm shadow-sm"
              >
                Optimizar asientos actuales
              </button>
              <button
                onClick={onAutoTablesRedistribute}
                className="px-5 py-2.5 font-semibold bg-brand-orange text-white hover:bg-[#e66a17] rounded-xl transition-colors text-sm shadow-md"
              >
                Añadir {pendingRedistribute.missing} sitios faltantes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}