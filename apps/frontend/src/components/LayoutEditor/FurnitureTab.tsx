// src/components/LayoutEditor/FurnitureTab.tsx
import React, { useState } from "react";
import { PALETTE } from "./constants";
import { Plus, Minus, GripHorizontal, Save, RefreshCw, Maximize, Trash2 } from "lucide-react";

interface FurnitureTabProps {
  hasUnsavedChanges: boolean;
  selectedLayoutId: string;
  classroomLayouts: any[];
  onLoadLayout: (id: string) => void;
  isSavingLayout: boolean;
  onSaveLayout: (saveAsNew: boolean) => void;
  isBoardEmpty: boolean;
  onArrangeTables: () => void;
  onClearBoard: () => void;
}

export default function FurnitureTab({
  hasUnsavedChanges,
  selectedLayoutId,
  classroomLayouts,
  onLoadLayout,
  isSavingLayout,
  onSaveLayout,
  isBoardEmpty,
  onArrangeTables,
  onClearBoard,
}: FurnitureTabProps) {
  const [selectedShape, setSelectedShape] = useState<"circle" | "square" | "rectangle">("circle");
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[0].hex);
  const [customCapacity, setCustomCapacity] = useState<number>(4);
  const [rectSeats, setRectSeats] = useState({ top: 2, bottom: 2, left: 1, right: 1 });

  const updateRectSeat = (side: keyof typeof rectSeats, delta: number) =>
    setRectSeats((p) => ({ ...p, [side]: Math.max(0, Math.min(8, p[side] + delta)) }));

  const totalRectCapacity = rectSeats.top + rectSeats.bottom + rectSeats.left + rectSeats.right;

  const onDragStartTable = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      "application/reactflow-table",
      JSON.stringify({ shape: selectedShape, color: selectedColor, capacity: customCapacity, rectSeats })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Editor de Mesa */}
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">Configurar Mesa</label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedShape("circle")}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${selectedShape === "circle" ? "border-brand-orange bg-brand-orange/5 text-brand-orange" : "border-brand-slate/20 text-brand-slate hover:bg-brand-cream/50"}`}
              >
                Redonda
              </button>
              <button
                onClick={() => setSelectedShape("square")}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${selectedShape === "square" ? "border-brand-orange bg-brand-orange/5 text-brand-orange" : "border-brand-slate/20 text-brand-slate hover:bg-brand-cream/50"}`}
              >
                Cuadrada
              </button>
            </div>
            <button
              onClick={() => setSelectedShape("rectangle")}
              className={`w-full py-2 text-xs font-semibold rounded-xl border transition-colors ${selectedShape === "rectangle" ? "border-brand-orange bg-brand-orange/5 text-brand-orange" : "border-brand-slate/20 text-brand-slate hover:bg-brand-cream/50"}`}
            >
              Rectangular
            </button>
          </div>
        </div>

        {selectedShape !== "rectangle" ? (
          <div className="flex items-center justify-between bg-brand-cream/50 border border-brand-slate/15 rounded-xl p-1.5">
            <button onClick={() => setCustomCapacity((p) => Math.max(2, p - 1))} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-brand-slate hover:text-brand-dark transition-colors"><Minus size={14} strokeWidth={3}/></button>
            <span className="font-mono font-bold text-brand-dark">{customCapacity}</span>
            <button onClick={() => setCustomCapacity((p) => Math.min(24, p + 1))} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-brand-slate hover:text-brand-dark transition-colors"><Plus size={14} strokeWidth={3}/></button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 bg-brand-cream/50 p-4 rounded-xl border border-brand-slate/15">
            {["top", "bottom", "left", "right"].map((side) => (
              <div key={side} className="flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest text-brand-slate">{side}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateRectSeat(side as any, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-brand-slate/15 rounded-md text-brand-slate hover:text-brand-dark"><Minus size={12} strokeWidth={3}/></button>
                  <span className="text-xs font-mono font-bold w-4 text-center text-brand-dark">{rectSeats[side as keyof typeof rectSeats]}</span>
                  <button onClick={() => updateRectSeat(side as any, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-brand-slate/15 rounded-md text-brand-slate hover:text-brand-dark"><Plus size={12} strokeWidth={3}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center px-1">
          {PALETTE.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedColor(c.hex)}
              className={`w-6 h-6 rounded-full transition-transform ${selectedColor === c.hex ? "ring-2 ring-offset-2 ring-brand-dark scale-110" : "opacity-80 hover:scale-110 hover:opacity-100 border border-black/10"}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <div
          className="p-5 mt-2 bg-brand-dark text-brand-cream rounded-xl cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-2 shadow-lg hover:bg-black transition-all"
          onDragStart={onDragStartTable}
          draggable
        >
          <GripHorizontal size={20} className="text-brand-slate opacity-70" />
          <span className="text-sm font-semibold text-center leading-tight">
            Arrastrar Mesa
            <br />
            <span className="text-xs text-brand-slate font-mono mt-1 block">
              {selectedShape === "rectangle" ? totalRectCapacity : customCapacity} asientos
            </span>
          </span>
        </div>
      </div>

      {/* Guardado y Planos */}
      <div className="bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">Biblioteca</label>
          {hasUnsavedChanges && selectedLayoutId && (
            <span className="text-[9px] font-bold text-brand-orange flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse"></span>
              Modificado
            </span>
          )}
        </div>
        
        <select 
          value={selectedLayoutId} 
          onChange={(e) => onLoadLayout(e.target.value)}
          className="w-full p-2.5 border border-brand-slate/20 rounded-xl text-sm font-sans bg-brand-cream/30 text-brand-dark focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all cursor-pointer appearance-none"
        >
          <option value="" disabled>-- Plano en blanco --</option>
          {classroomLayouts.map((l: any) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        {selectedLayoutId ? (
          <div className="flex gap-2">
            <button 
              onClick={() => onSaveLayout(false)}
              disabled={isSavingLayout || !hasUnsavedChanges}
              className="flex-1 py-2.5 bg-brand-cream text-brand-dark border border-brand-slate/20 hover:bg-brand-slate/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
            <button 
              onClick={() => onSaveLayout(true)}
              disabled={isSavingLayout}
              className="flex-1 py-2.5 bg-brand-dark text-white hover:bg-black disabled:opacity-40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Save size={14} />
              Nuevo
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onSaveLayout(true)}
            disabled={isSavingLayout || isBoardEmpty}
            className="w-full py-2.5 bg-brand-dark text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />
            Guardar plano base
          </button>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 shrink-0">
        <button
          onClick={onArrangeTables}
          disabled={isBoardEmpty}
          className="w-full py-3 bg-white border border-brand-slate/20 text-brand-dark font-semibold rounded-xl hover:bg-brand-cream transition-colors disabled:opacity-40 flex justify-center items-center gap-2 text-sm shadow-sm"
        >
          <Maximize size={16} className="text-brand-slate" />
          Alinear Cuadrícula
        </button>
        <button
          onClick={onClearBoard}
          disabled={isBoardEmpty}
          className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 disabled:opacity-40 transition-colors flex justify-center items-center gap-2 text-sm"
        >
          <Trash2 size={16} />
          Vaciar Plano
        </button>
      </div>
    </div>
  );
}