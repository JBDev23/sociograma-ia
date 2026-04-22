// src/components/WorkspaceHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import { 
  Network, BarChart2, Folder, Sparkles, X, Filter, Save, 
  CheckCircle2, Loader2, ChevronDown, LayoutList, Heart, 
  Swords, BookOpen, Gamepad2, Check, Calendar // <-- Añadido Calendar
} from "lucide-react";

export interface ViewTab {
  id: string;
  title: string;
  groups: any[] | null;
  type: "system" | "saved" | "temp";
}

interface WorkspaceHeaderProps {
  tabs: ViewTab[];
  activeTabId: string;
  switchTab: (id: string) => void;
  removeTab: (id: string, e: React.MouseEvent) => void;
  
  // Filtros originales
  filterType: string;
  setFilterType: (val: string) => void;
  filterContext: string;
  setFilterContext: (val: string) => void;
  
  // NUEVO: Selector de Encuesta (Tiempo)
  forms: { id: string; title: string }[];
  selectedFormId: string;
  setSelectedFormId: (val: string) => void;

  // Estados de guardado
  isHistoricalTab: boolean;
  isSaving: boolean;
  savedTabId: string | null;
  onSaveDistribution: () => void;
}

// --- SUBCOMPONENTE: Dropdown Personalizado ---
interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon: React.ElementType }[];
}

const CustomSelect = ({ value, onChange, options }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];
  const SelectedIcon = selectedOption?.icon || LayoutList;

  if (options.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex overflow-hidden items-center gap-2.5 bg-brand-cream/40 border border-brand-slate/20 text-brand-dark text-sm rounded-xl px-3.5 py-2 outline-none hover:border-brand-orange hover:ring-1 hover:ring-brand-orange transition-all cursor-pointer font-medium w-52.5 justify-between"
      >
        <div className="flex items-center gap-2 w-full">
          <SelectedIcon size={15} className={value !== "ALL" ? "text-brand-orange" : "text-brand-slate"} />
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown size={14} className={`text-brand-slate transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1.5 left-0 w-full bg-white border border-brand-slate/15 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((option) => {
            const isSelected = option.value === value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-brand-cream/50 ${
                  isSelected ? "text-brand-orange font-bold bg-brand-orange/5" : "text-brand-dark font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <Icon size={15} className={`shrink-0 ${isSelected ? "text-brand-orange" : "text-brand-slate"}`} />
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-brand-orange shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function WorkspaceHeader({
  tabs,
  activeTabId,
  switchTab,
  removeTab,
  filterType,
  setFilterType,
  filterContext,
  setFilterContext,
  forms,                 // <-- NUEVO
  selectedFormId,        // <-- NUEVO
  setSelectedFormId,     // <-- NUEVO
  isHistoricalTab,
  isSaving,
  savedTabId,
  onSaveDistribution,
}: WorkspaceHeaderProps) {
  
  const getTabIcon = (tab: ViewTab, isActive: boolean) => {
    const color = isActive ? "text-brand-orange" : "text-brand-slate";
    if (tab.id === "full-class") return <Network size={16} className={color} />;
    if (tab.id === "report") return <BarChart2 size={16} className={color} />;
    if (tab.type === "saved") return <Folder size={16} className={color} />;
    if (tab.type === "temp") return <Sparkles size={16} className={color} />;
    return null;
  };

  const TYPE_OPTIONS = [
    { value: "ALL", label: "Todas las Relaciones", icon: LayoutList },
    { value: "AFFINITY", label: "Solo Afinidades", icon: Heart },
    { value: "CONFLICT", label: "Solo Conflictos", icon: Swords },
  ];

  const CONTEXT_OPTIONS = [
    { value: "ALL", label: "Ambos Contextos", icon: LayoutList },
    { value: "WORK", label: "Solo Trabajo", icon: BookOpen },
    { value: "PLAY", label: "Solo Ocio", icon: Gamepad2 },
  ];

  // NUEVO: Mapeamos las encuestas para el dropdown
  const FORM_OPTIONS = forms.map(form => ({
    value: form.id,
    label: form.title,
    icon: Calendar
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* BARRA DE PESTAÑAS */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm border ${
                isActive
                  ? "bg-brand-dark text-white border-brand-dark"
                  : "bg-white text-brand-slate hover:bg-brand-cream/50 hover:text-brand-dark border-brand-slate/20"
              }`}
            >
              {getTabIcon(tab, isActive)}
              {tab.title}
              {tab.type !== "system" && (
                <span
                  onClick={(e) => removeTab(tab.id, e)}
                  className={`ml-1 w-5 h-5 flex items-center justify-center rounded-md transition-colors ${
                    isActive 
                      ? "hover:bg-white/20 text-brand-slate hover:text-red-300" 
                      : "hover:bg-red-50 text-brand-slate/50 hover:text-red-500"
                  }`}
                >
                  <X size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* BARRA DE FILTROS Y ACCIONES */}
      {activeTabId !== "report" && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-brand-slate/15">
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* NUEVO: SELECTOR DE ENCUESTA (TIEMPO) */}
            {FORM_OPTIONS.length > 0 && (
              <div className="flex items-center gap-2 mr-2 border-r border-brand-slate/15 pr-4">
                <span className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={14} /> Encuesta:
                </span>
                <CustomSelect 
                  value={selectedFormId} 
                  onChange={setSelectedFormId} 
                  options={FORM_OPTIONS} 
                />
              </div>
            )}

            <span className="text-[11px] font-bold text-brand-slate uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Filter size={14} /> Filtros:
            </span>
            
            <CustomSelect 
              value={filterType} 
              onChange={setFilterType} 
              options={TYPE_OPTIONS} 
            />
            
            <CustomSelect 
              value={filterContext} 
              onChange={setFilterContext} 
              options={CONTEXT_OPTIONS} 
            />
          </div>

          {/* DERECHA: BOTÓN DE GUARDAR */}
          {activeTabId !== "full-class" && !isHistoricalTab && (
            <button
              onClick={onSaveDistribution}
              disabled={isSaving || savedTabId === activeTabId}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                savedTabId === activeTabId
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                  : "bg-brand-orange text-white hover:bg-[#e66a17] active:scale-[0.98] cursor-pointer"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : savedTabId === activeTabId ? (
                <>
                  <CheckCircle2 size={16} /> Guardado
                </>
              ) : (
                <>
                  <Save size={16} /> Guardar distribución
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}