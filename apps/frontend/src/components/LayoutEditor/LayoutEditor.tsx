// src/components/LayoutEditor/LayoutEditor.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { ReactFlow, Background, Controls, useNodesState, Node } from "@xyflow/react";
import { redistributeWithAI, saveProjectClassroomLayout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LayoutGrid, Users } from "lucide-react";

import TableLayoutNode from "../TableLayoutNode";
import { PALETTE } from "./constants";
import FurnitureTab from "./FurnitureTab";
import StudentsTab from "./StudentsTab";
import WarningModal from "./WarningModal";

interface LayoutEditorProps {
  project: any;
  initialStudents: string[];
  forms: { id: string; title: string }[];
}

const nodeTypes = { table: TableLayoutNode };

export default function LayoutEditor({ project, initialStudents, forms }: LayoutEditorProps) {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"furniture" | "students">("furniture");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'warning' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");
  const classroomLayouts = Array.isArray(project?.classroomLayouts) ? project.classroomLayouts : [];
  const savedDistributions = Array.isArray(project?.savedDistributions)
    ? project.savedDistributions
    : typeof project?.savedDistributions === 'string'
      ? JSON.parse(project.savedDistributions)
      : [];

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [pendingRedistribute, setPendingRedistribute] = useState<{ config: any[], missing: number } | null>(null);

  const [selectedFormId, setSelectedFormId] = useState<string>(
    forms?.length > 0 ? forms[0].id : ""
  );

  const seatedStudents = nodes
    .flatMap((n) => (n.data as any).students || [])
    .filter(Boolean) as string[];

  const unassignedStudents = initialStudents.filter((student) => !seatedStudents.includes(student));

  const totalSeats = nodes.reduce((acc, node) => {
    const data = node.data as any;
    const cap = data.shape === "rectangle"
      ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right
      : data.capacity;
    return acc + cap;
  }, 0);

  const availableSeats = totalSeats - seatedStudents.length;
  const hasEnoughSeats = availableSeats >= unassignedStudents.length;

  const showToast = useCallback((message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    const isModifying = changes.some((c: any) => c.type === 'position' || c.type === 'add' || c.type === 'remove');
    if (isModifying) setHasUnsavedChanges(true);
  }, [onNodesChange]);

  const handleLoadLayout = (id: string) => {
    const layout = classroomLayouts.find((l: any) => l.id === id);
    if (layout) {
      setNodes(layout.nodes);
      setSelectedLayoutId(id);
      setTimeout(() => reactFlowInstance?.fitView({ duration: 800, padding: 0.2 }), 100);
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveBaseLayout = async (saveAsNew: boolean = false) => {
    if (nodes.length === 0) return;
    
    const isUpdating = !saveAsNew && selectedLayoutId !== "";
    const currentLayoutName = classroomLayouts.find((l: any) => l.id === selectedLayoutId)?.name;
    let layoutName = currentLayoutName;

    if (!isUpdating) {
      layoutName = window.prompt("Nombre para este plano físico:", currentLayoutName ? `${currentLayoutName} (copia)` : "Mi nuevo plano");
      if (!layoutName) return; 
    }

    setIsSavingLayout(true);
    try {
      await saveProjectClassroomLayout(project.id, {
        id: isUpdating ? selectedLayoutId : undefined,
        name: layoutName,
        nodes: nodes
      });
      showToast(isUpdating ? "Plano actualizado correctamente." : "Nuevo plano guardado en la biblioteca.");
      setHasUnsavedChanges(false);
      router.refresh();
    } catch (error) {
      showToast("Error al guardar el plano.", "warning");
    } finally {
      setIsSavingLayout(false);
    }
  };

  const handleSmartRedistribute = async () => {
    let totalCapacity = 0;
    const tablesConfig = nodes.map((node) => {
      const data = node.data as any;
      const capacity = data.shape === "rectangle"
        ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right
        : data.capacity;
      totalCapacity += capacity;
      return { id: node.id, capacity };
    });

    const totalStudents = project?.members?.length || 0;
    
    if (totalCapacity < totalStudents) {
      const missing = totalStudents - totalCapacity;
      setWarningMessages([
        `Hay ${totalCapacity} sillas en el plano, pero asisten ${totalStudents} alumnos.`,
        `Faltan ${missing} sitios para completar la asignación.`
      ]);
      setPendingRedistribute({ config: tablesConfig, missing });
      setIsWarningModalOpen(true);
    } else {
      executeSmartRedistribute(tablesConfig);
    }
  };

  const executeSmartRedistribute = async (tablesConfig: any[]) => {
    setIsWarningModalOpen(false);
    setPendingRedistribute(null);
    setIsProcessingAI(true);

    try {
      const assignments = await redistributeWithAI(project.id, tablesConfig, selectedFormId);

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const tableAssignment = assignments.find((a: any) => a.tableId === node.id);
          if (!tableAssignment) return node;

          const studentNames = tableAssignment.students.map((m: any) => {
            const identifier = typeof m === 'string' ? m : (m.name || m.id);
            const member = project?.members?.find((p: any) => p.id === identifier || p.name === identifier);
            return member ? member.name : identifier;
          });

          const data = node.data as any;
          const capacity = data.shape === "rectangle"
            ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right
            : data.capacity;
            
          const paddedStudents = Array.from({ length: capacity }, (_, i) => studentNames[i] || null);
          return { ...node, data: { ...data, students: paddedStudents } };
        })
      );
      showToast("Alumnos distribuidos con IA.");
    } catch (error) {
      console.error(error);
      showToast("Error al optimizar. Revisa la consola.", "warning");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const executeWithAutoTables = (tablesConfig: any[], missingChairs: number) => {
    const newTableId = `table-auto-${Date.now()}`;
    const newNode: Node = {
      id: newTableId,
      type: "table",
      position: { x: 50, y: 50 },
      data: {
        label: `Mesa Extra`,
        shape: missingChairs > 6 ? "rectangle" : "circle",
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)].hex,
        capacity: missingChairs,
        rectSeats: missingChairs > 6 
          ? { top: Math.ceil(missingChairs/2), bottom: Math.floor(missingChairs/2), left: 0, right: 0 } 
          : undefined,
        students: Array(missingChairs).fill(null),
      },
    };

    setNodes((prev) => [...prev, newNode]);
    executeSmartRedistribute([...tablesConfig, { id: newTableId, capacity: missingChairs }]);
  };

  const handleArrangeTables = useCallback((currentNodes: Node[]) => {
    if (currentNodes.length === 0) return currentNodes;

    const getTableDimensions = (data: any) => {
      if (data.shape === "rectangle" && data.rectSeats) {
        return { 
          width: Math.max(data.rectSeats.top, data.rectSeats.bottom, 1) * 60 + 40, 
          height: Math.max(data.rectSeats.left, data.rectSeats.right, 1) * 60 + 40 
        };
      }
      const size = Math.max(120, (data.capacity || 4) * 20); 
      return { width: size, height: size };
    };

    const cols = Math.ceil(Math.sqrt(currentNodes.length));
    const rows = Math.ceil(currentNodes.length / cols);
    const colWidths = Array(cols).fill(0);
    const rowHeights = Array(rows).fill(0);

    currentNodes.forEach((node, index) => {
      const { width, height } = getTableDimensions(node.data);
      if (width > colWidths[index % cols]) colWidths[index % cols] = width;
      if (height > rowHeights[Math.floor(index / cols)]) rowHeights[Math.floor(index / cols)] = height;
    });

    const colPositions = [50];
    for (let i = 0; i < cols - 1; i++) colPositions.push(colPositions[i] + colWidths[i] + 150);

    const rowPositions = [50];
    for (let i = 0; i < rows - 1; i++) rowPositions.push(rowPositions[i] + rowHeights[i] + 150);

    return currentNodes.map((node, index) => {
      const { width, height } = getTableDimensions(node.data);
      return {
        ...node,
        position: { 
          x: colPositions[index % cols] + (colWidths[index % cols] - width) / 2, 
          y: rowPositions[Math.floor(index / cols)] + (rowHeights[Math.floor(index / cols)] - height) / 2 
        },
      };
    });
  }, []);

  const triggerArrange = () => {
    setNodes((nds) => handleArrangeTables(nds));
    setTimeout(() => reactFlowInstance?.fitView({ duration: 800, padding: 0.2 }), 50);
  };

  const applySavedDistribution = (distId: string) => {
    const dist = savedDistributions.find((d: any) => d.id === distId);
    if (!dist || !dist.groups) return;

    if (nodes.length === 0) {
      executeAutoCreateDistribution(distId);
      return;
    }

    const groupsSource = dist.groups.suggestedGroups || dist.groups;
    let warnings: string[] = [];

    if (nodes.length < groupsSource.length) warnings.push(`Faltan ${groupsSource.length - nodes.length} mesas.`);

    for (let i = 0; i < Math.min(groupsSource.length, nodes.length); i++) {
      const rawMembers = groupsSource[i].members || groupsSource[i].students || (Array.isArray(groupsSource[i]) ? groupsSource[i] : []);
      const nodeData = nodes[i].data as any;
      const tableCapacity = nodeData.shape === "rectangle"
        ? nodeData.rectSeats.top + nodeData.rectSeats.bottom + nodeData.rectSeats.left + nodeData.rectSeats.right
        : nodeData.capacity;

      if (rawMembers.length > tableCapacity) {
        warnings.push(`La ${nodeData.label} es pequeña para el Grupo ${i + 1} (${rawMembers.length} alumnos).`);
      }
    }

    if (warnings.length > 0) {
      setWarningMessages(warnings);
      setPendingTemplateId(distId);
      setIsWarningModalOpen(true);
    } else {
      executeApplyDistribution(distId);
    }
  };

  const executeApplyDistribution = (distId: string) => {
    const groupsSource = savedDistributions.find((d: any) => d.id === distId)?.groups?.suggestedGroups || savedDistributions.find((d: any) => d.id === distId)?.groups;
    if (!groupsSource) return;

    setNodes((currentNodes) => currentNodes.map((node, index) => {
      const data = node.data as any;
      const capacity = data.shape === "rectangle"
        ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right
        : data.capacity;

      if (!groupsSource[index]) return { ...node, data: { ...data, students: Array(capacity).fill(null) } };

      const rawMembers = groupsSource[index].members || groupsSource[index].students || (Array.isArray(groupsSource[index]) ? groupsSource[index] : []);
      const studentNames = rawMembers.map((m: any) => {
        const id = typeof m === 'string' ? m : (m.name || m.id);
        return project?.members?.find((p: any) => p.id === id || p.name === id)?.name || id;
      });

      return { ...node, data: { ...data, students: Array.from({ length: capacity }, (_, i) => studentNames[i] || null) } };
    }));

    setIsWarningModalOpen(false);
    setPendingTemplateId(null);
  };

  const executeAutoCreateDistribution = (distId: string) => {
    const groupsSource = savedDistributions.find((d: any) => d.id === distId)?.groups?.suggestedGroups || savedDistributions.find((d: any) => d.id === distId)?.groups;
    if (!groupsSource) return;

    const newNodes: Node[] = groupsSource.map((group: any, index: number) => {
      const rawMembers = group.members || group.students || (Array.isArray(group) ? group : []);
      const capacity = Math.max(1, rawMembers.length); 
      const studentNames = rawMembers.map((m: any) => {
        const id = typeof m === 'string' ? m : (m.name || m.id);
        return project?.members?.find((p: any) => p.id === id || p.name === id)?.name || id;
      });

      return {
        id: `table-${distId}-${index}-${Date.now()}`,
        type: "table",
        position: { x: 0, y: 0 },
        data: {
          label: `Mesa ${index + 1}`,
          shape: capacity > 6 ? "rectangle" : "circle",
          color: PALETTE[index % PALETTE.length].hex,
          capacity: capacity,
          rectSeats: capacity > 6 ? { top: Math.ceil(capacity/2), bottom: Math.floor(capacity/2), left: 0, right: 0 } : undefined,
          students: Array.from({ length: capacity }, (_, i) => studentNames[i] || null),
        },
      };
    });

    setNodes(handleArrangeTables(newNodes));
    setIsWarningModalOpen(false);
    setPendingTemplateId(null);
    setTimeout(() => reactFlowInstance?.fitView({ duration: 800, padding: 0.2 }), 100);
  };

  const handleRandomDistribute = () => {
    setNodes((nds) => {
      let toAssign = [...unassignedStudents].sort(() => Math.random() - 0.5);
      if (toAssign.length === 0) return nds;

      return nds.map((node) => {
        const data = node.data as any;
        const cap = data.shape === "rectangle"
            ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right
            : data.capacity;

        let currentStudents = Array.from({ length: cap }, (_, index) => data.students && data.students[index] ? data.students[index] : null);
        let hasChanged = false;

        for (let i = 0; i < currentStudents.length; i++) {
          if (!currentStudents[i] && toAssign.length > 0) {
            currentStudents[i] = toAssign.shift()!;
            hasChanged = true;
          }
        }
        return hasChanged ? { ...node, data: { ...data, students: currentStudents } } : node;
      });
    });
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const configStr = event.dataTransfer.getData("application/reactflow-table");
    if (!configStr || !reactFlowInstance) return;

    const config = JSON.parse(configStr);
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const mesaNumbers = reactFlowInstance.getNodes()
      .map((n: Node) => n.data.label as string)
      .filter((label: string) => label && label.startsWith("Mesa "))
      .map((label: string) => parseInt(label.replace("Mesa ", ""), 10))
      .filter((num: number) => !isNaN(num));

    const newNode: Node = {
      id: `table-${Date.now()}`,
      type: "table",
      position,
      data: {
        label: `Mesa ${mesaNumbers.length > 0 ? Math.max(...mesaNumbers) + 1 : 1}`,
        shape: config.shape,
        color: config.color,
        capacity: config.capacity,
        rectSeats: config.rectSeats,
        students: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
  }, [reactFlowInstance, setNodes]);

  return (
    <div className="flex h-200 w-full border border-brand-slate/20 rounded-2xl overflow-hidden bg-brand-cream shadow-xl font-sans">
      <aside className="w-85 bg-brand-cream/60 backdrop-blur-sm border-r border-brand-slate/20 flex flex-col overflow-hidden relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        
        {/* Navegación por Pestañas */}
        <div className="flex bg-white border-b border-brand-slate/15 shrink-0 px-2 pt-2 gap-1">
          <button
            onClick={() => setActiveTab("furniture")}
            className={`flex-1 py-3.5 px-2 font-semibold text-[13px] transition-all rounded-t-xl flex items-center justify-center gap-2 ${
              activeTab === "furniture" 
                ? "bg-brand-cream text-brand-dark border-t border-x border-brand-slate/15 translate-y-px" 
                : "text-brand-slate hover:bg-gray-50 hover:text-brand-dark"
            }`}
          >
            <LayoutGrid size={16} />
            Mobiliario
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex-1 py-3.5 px-2 font-semibold text-[13px] transition-all rounded-t-xl flex items-center justify-center gap-2 ${
              activeTab === "students" 
                ? "bg-brand-cream text-brand-dark border-t border-x border-brand-slate/15 translate-y-px" 
                : "text-brand-slate hover:bg-gray-50 hover:text-brand-dark"
            }`}
          >
            <Users size={16} />
            Alumnos
            {unassignedStudents.length > 0 && (
              <span className="bg-brand-orange text-white px-2 py-0.5 rounded-full text-[10px] font-mono leading-none flex items-center justify-center ml-1">
                {unassignedStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col custom-scrollbar">
          {activeTab === "furniture" && (
            <FurnitureTab 
              hasUnsavedChanges={hasUnsavedChanges}
              selectedLayoutId={selectedLayoutId}
              classroomLayouts={classroomLayouts}
              onLoadLayout={handleLoadLayout}
              isSavingLayout={isSavingLayout}
              onSaveLayout={handleSaveBaseLayout}
              isBoardEmpty={nodes.length === 0}
              onArrangeTables={triggerArrange}
              onClearBoard={() => { setNodes([]); setHasUnsavedChanges(true); }}
            />
          )}
          {activeTab === "students" && (
            <StudentsTab 
              savedDistributions={savedDistributions}
              projectActiveDistributionId={project?.activeDistributionId || ""}
              onApplyDistribution={applySavedDistribution}
              unassignedStudents={unassignedStudents}
              hasEnoughSeats={hasEnoughSeats}
              availableSeats={availableSeats}
              onRandomDistribute={handleRandomDistribute}
              onClearStudents={() => setNodes(nds => nds.map(n => ({ ...n, data: { ...(n.data as any), students: [] } })))}
              isBoardEmpty={nodes.length === 0}
              isProcessingAI={isProcessingAI}
              onSmartRedistribute={handleSmartRedistribute}
              seatedStudentsCount={seatedStudents.length}
              forms={forms}
              selectedFormId={selectedFormId}
              onFormChange={setSelectedFormId}
            />
          )}
        </div>
      </aside>

      {/* Zona React Flow */}
      <div className="flex-1 bg-white relative" ref={reactFlowWrapper}>
        <ReactFlow 
          nodes={nodes} 
          nodeTypes={nodeTypes} 
          onNodesChange={handleNodesChange} 
          onInit={setReactFlowInstance} 
          onDrop={onDrop} 
          onDragOver={onDragOver} 
          fitView
          minZoom={0.2}
        >
          <Background gap={24} color="var(--color-brand-slate)" size={1.5} className="opacity-20" />
          <Controls className="fill-brand-dark border-brand-slate/20 shadow-md rounded-xl overflow-hidden" />
        </ReactFlow>
      </div>

      {/* Notificaciones (Toasts) */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 font-semibold text-sm border ${
          toast.type === 'success' 
            ? 'bg-brand-dark text-white border-brand-dark/50' 
            : 'bg-white text-brand-dark border-brand-orange border-l-4 border-l-brand-orange'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Modales */}
      {isWarningModalOpen && (
        <WarningModal 
          warningMessages={warningMessages}
          pendingTemplateId={pendingTemplateId}
          pendingRedistribute={pendingRedistribute}
          onClose={() => { setIsWarningModalOpen(false); setPendingTemplateId(null); setPendingRedistribute(null); }}
          onContinueTemplate={() => pendingTemplateId && executeApplyDistribution(pendingTemplateId)}
          onAutoCreateTemplate={() => pendingTemplateId && executeAutoCreateDistribution(pendingTemplateId)}
          onContinueRedistribute={() => pendingRedistribute && executeSmartRedistribute(pendingRedistribute.config)}
          onAutoTablesRedistribute={() => pendingRedistribute && executeWithAutoTables(pendingRedistribute.config, pendingRedistribute.missing)}
        />
      )}
    </div>
  );
}