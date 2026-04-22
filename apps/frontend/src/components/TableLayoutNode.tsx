// src/components/TableLayoutNode.tsx
import { Handle, Position, useReactFlow } from "@xyflow/react";

interface RectSeats {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
interface TableNodeData {
  label: string;
  shape?: "circle" | "square" | "rectangle";
  color?: string;
  capacity?: number;
  rectSeats?: RectSeats;
  students?: (string | null)[]; // Array con los nombres o null si está vacía
}

export default function TableLayoutNode({
  id,
  data,
}: {
  id: string;
  data: TableNodeData;
}) {
  const { setNodes } = useReactFlow();

  const shape = data.shape || "circle";
  const bgColor = data.color || "#fef3c7";

  let tableWidth = 120;
  let tableHeight = 120;
  let totalCapacity = data.capacity || 4;
  let chairPositions: { x: number; y: number }[] = [];

  // --- CÁLCULOS MATEMÁTICOS (Igual que antes) ---
  if (shape === "rectangle" && data.rectSeats) {
    const { top, right, bottom, left } = data.rectSeats;
    totalCapacity = top + right + bottom + left;
    tableWidth = Math.max(top, bottom, 1) * 60 + 40;
    tableHeight = Math.max(left, right, 1) * 60 + 40;

    const addLine = (
      count: number,
      isHorizontal: boolean,
      fixedPos: number,
    ) => {
      const spacing = 60;
      const startOffset = -((count - 1) * spacing) / 2;
      for (let i = 0; i < count; i++) {
        chairPositions.push(
          isHorizontal
            ? { x: startOffset + i * spacing, y: fixedPos }
            : { x: fixedPos, y: startOffset + i * spacing },
        );
      }
    };
    addLine(top, true, -(tableHeight / 2) - 35);
    addLine(right, false, tableWidth / 2 + 35);
    addLine(bottom, true, tableHeight / 2 + 35);
    addLine(left, false, -(tableWidth / 2) - 35);
  } else {
    tableWidth = Math.max(120, totalCapacity*20);
    tableHeight = tableWidth;
    for (let i = 0; i < totalCapacity; i++) {
      const angle = (i / totalCapacity) * 2 * Math.PI;
      let distance =
        shape === "square"
          ? tableWidth /
              2 /
              Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle))) +
            35
          : tableWidth / 2 + 35;
      chairPositions.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    }
  }

  // Aseguramos que el array de alumnos tenga la longitud correcta
  const students = data.students || Array(totalCapacity).fill(null);

  // --- INTERACTIVIDAD DE LAS SILLAS ---
  const handleDropStudent = (e: React.DragEvent, chairIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const studentName = e.dataTransfer.getData("application/student");
    if (!studentName) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const currentData = node.data as unknown as TableNodeData;
          const newStudents = [
            ...(currentData.students || Array(totalCapacity).fill(null)),
          ];
          newStudents[chairIndex] = studentName;
          return { ...node, data: { ...currentData, students: newStudents } };
        }
        return node;
      }),
    );
  };

  const handleRemoveStudent = (e: React.MouseEvent, chairIndex: number) => {
    e.stopPropagation();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const currentData = node.data as unknown as TableNodeData;
          const newStudents = [
            ...(currentData.students || Array(totalCapacity).fill(null)),
          ];
          newStudents[chairIndex] = null;
          return { ...node, data: { ...currentData, students: newStudents } };
        }
        return node;
      }),
    );
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: tableWidth, height: tableHeight }}
    >
      {/* LA MESA */}
      <div
        className={`group absolute inset-0 border-4 border-black/20 shadow-lg flex items-center justify-center z-10 transition-all ${shape === "circle" ? "rounded-full" : "rounded-2xl"}`}
        style={{ backgroundColor: bgColor }}
      >
        <span className="font-black text-black/60 text-lg select-none pointer-events-none">
          {data.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNodes((nodes) => nodes.filter((n) => n.id !== id));
          }}
          className="absolute -top-px w-8 h-8 bg-white border-2 border-red-500 text-red-600 rounded-full font-bold shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 hover:bg-red-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* LAS SILLAS (AHORA INTERACTIVAS) */}
      {chairPositions.map((pos, i) => {
        const assignedStudent = students[i];
        return (
          <div
            key={i}
            // Eventos de arrastre
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => handleDropStudent(e, i)}
            // Evento para quitar alumno (solo si hay uno)
            onClick={(e) => assignedStudent && handleRemoveStudent(e, i)}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all z-20 border-2 
              ${
                assignedStudent
                  ? "bg-indigo-600 border-indigo-800 text-white cursor-pointer hover:bg-red-500 hover:border-red-700" // Si hay alumno, se pone rojo al hacer hover (para borrar)
                  : "bg-white border-dashed border-gray-400 hover:border-indigo-500 hover:bg-indigo-50 hover:scale-110" // Si está vacía, invita a soltar
              }`}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
            title={
              assignedStudent
                ? "Clic para quitar alumno"
                : "Suelta un alumno aquí"
            }
          >
            {assignedStudent ? (
              <span className="text-xs font-bold truncate px-1">
                {assignedStudent.substring(0, 4)}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium pointer-events-none">
                Vacía
              </span>
            )}
          </div>
        );
      })}

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
