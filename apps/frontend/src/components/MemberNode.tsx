import { Handle, Position } from '@xyflow/react';

interface MemberNodeProps {
  data: {
    label: string;
    role?: string;
  };
}

export default function MemberNode({ data }: MemberNodeProps) {
  const initial = data.label ? data.label.charAt(0).toUpperCase() : '?';

  return (
    <div 
      title={data.label} 
      // Ancho fijo de 36 (144px) para mantener coherencia en las matemáticas del layout
      className="relative flex items-center gap-2.5 px-3 py-2 bg-white border border-brand-slate/20 rounded-full shadow-sm w-36 hover:border-brand-orange hover:ring-1 hover:ring-brand-orange z-50 cursor-pointer transition-all font-sans group"
    >
      
      {/* PUERTOS DE ENTRADA (Target) */}
      <Handle type="target" position={Position.Top} id="t-top" className="w-1 h-1 opacity-0 -top-1" />
      <Handle type="target" position={Position.Bottom} id="t-bottom" className="w-1 h-1 opacity-0 -bottom-1" />
      <Handle type="target" position={Position.Left} id="t-left" className="w-1 h-1 opacity-0 -left-1" />
      <Handle type="target" position={Position.Right} id="t-right" className="w-1 h-1 opacity-0 -right-1" />
      
      {/* Avatar */}
      <div className="flex items-center justify-center w-8 h-8 shrink-0 text-xs font-bold text-brand-dark bg-brand-cream border border-brand-slate/15 rounded-full shadow-inner font-mono group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-colors">
        {initial}
      </div>
      
      {/* Info */}
      <div className="flex flex-col z-10 relative min-w-0 flex-1 justify-center">
        <span className="text-[13px] font-bold text-brand-dark truncate block leading-tight">
          {data.label}
        </span>
        {data.role && (
          <span className="text-[9px] text-brand-slate uppercase tracking-widest font-mono truncate block mt-0.5">
            {data.role}
          </span>
        )}
      </div>

      {/* PUERTOS DE SALIDA (Source) */}
      <Handle type="source" position={Position.Top} id="s-top" className="w-1 h-1 opacity-0 -top-1" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="w-1 h-1 opacity-0 -bottom-1" />
      <Handle type="source" position={Position.Left} id="s-left" className="w-1 h-1 opacity-0 -left-1" />
      <Handle type="source" position={Position.Right} id="s-right" className="w-1 h-1 opacity-0 -right-1" />
    </div>
  );
} 