// src/components/ProjectWorkspace.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { ProjectWithDetails } from "@sociograma/shared";
import { useRouter } from "next/navigation";
import { deleteProjectDistribution, saveProjectDistribution } from "@/lib/api";

import SociogramEditor from "./SociogramEditor";
import AiAssistant from "./AiAssistant";
import SociometricReport from "./SociometricReport";
import WorkspaceHeader, { ViewTab } from "./WorkspaceHeader";

interface ProjectWorkspaceProps {
  project: ProjectWithDetails & { forms?: any[] }; // Aseguramos que tipado acepta forms
  initialNodes: Node[];
  initialEdges: Edge[];
}

// Helper matemático para recalcular los enganches
function getSmartHandles(sourceNode: Node, targetNode: Node) {
  const sourceX = sourceNode.position.x + 72;
  const sourceY = sourceNode.position.y + 24;
  const targetX = targetNode.position.x + 72;
  const targetY = targetNode.position.y + 24;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  const normalizedDx = Math.abs(dx) / 144;
  const normalizedDy = Math.abs(dy) / 48;

  if (normalizedDx > normalizedDy) {
    if (dx > 0) return { sourceHandle: "s-right", targetHandle: "t-left" };
    return { sourceHandle: "s-left", targetHandle: "t-right" };
  } else {
    if (dy > 0) return { sourceHandle: "s-bottom", targetHandle: "t-top" };
    return { sourceHandle: "s-top", targetHandle: "t-bottom" };
  }
}

export default function ProjectWorkspace({
  project,
  initialNodes,
  initialEdges,
}: ProjectWorkspaceProps) {
  const router = useRouter();

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const [tabs, setTabs] = useState<ViewTab[]>(() => {
    const savedDistributions = Array.isArray(project.savedDistributions)
      ? project.savedDistributions
      : typeof project.savedDistributions === "string"
        ? JSON.parse(project.savedDistributions)
        : [];

    const historyTabs: ViewTab[] = savedDistributions.map((dist: any) => ({
      id: dist.id,
      title: dist.name,
      groups: dist.groups,
      type: "saved",
    }));

    return [
      { id: "full-class", title: "Clase Completa", groups: null, type: "system" },
      { id: "report", title: "Informe Analítico", groups: null, type: "system" },
      ...historyTabs,
    ];
  });

  const availableForms = (project.forms || []).filter(f => f.status !== "DRAFT");

  const [activeTabId, setActiveTabId] = useState<string>("full-class");
  const [filterType, setFilterType] = useState<string>("ALL"); 
  const [filterContext, setFilterContext] = useState<string>("ALL"); 
  
  // NUEVO ESTADO: Formulario Seleccionado (Por defecto el más reciente, o vacío)
  const [selectedFormId, setSelectedFormId] = useState<string>(
    availableForms.length > 0 ? availableForms[0].id : ""
  );

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedTabId, setSavedTabId] = useState<string | null>(null);

  const handleSaveDistribution = async () => {
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (!currentTab || !currentTab.groups) return;

    const distributionName = window.prompt("¿Qué nombre quieres darle a esta distribución?", "Nueva Distribución");
    if (!distributionName) return;

    setIsSaving(true);
    try {
      const updatedProject = await saveProjectDistribution(project.id, distributionName, currentTab.groups);
      
      const savedDistributions = updatedProject.savedDistributions || [];
      const newDistribution = savedDistributions[savedDistributions.length - 1];
      const realId = newDistribution.id; 

      setTabs((prev) => 
        prev.map((tab) => 
          tab.id === activeTabId 
            ? { ...tab, id: realId, title: distributionName, type: "saved" } 
            : tab
        )
      );
      
      setActiveTabId(realId);
      setSavedTabId(realId); 
      router.refresh(); 
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo guardar la distribución.");
    } finally {
      setIsSaving(false);
    }
  };

  const applyLayout = useCallback(
    (suggestedGroups: any[] | null, fType: string, fContext: string, focusId: string | null, formId: string) => {
      let newNodes = [...initialNodes];
      const studentToGroupMap: Record<string, string> = {};

      if (suggestedGroups) {
        const numGroups = suggestedGroups.length;
        const centerX = 600;
        const centerY = 450;

        const tableData = suggestedGroups.map((group) => {
          const numStudents = group.members.length;
          const radius = Math.max(80, (numStudents * 200) / (2 * Math.PI));
          const padding = Math.max(80, numStudents * 50);
          return { radius, padding, numStudents };
        });

        const totalCircumference = tableData.reduce((sum, data) => sum + data.radius * 2 + data.padding, 0);
        const macroRadius = Math.max(300, totalCircumference / (2 * Math.PI));
        let currentAngle = 0;

        suggestedGroups.forEach((group, groupIndex) => {
          const currentTable = tableData[groupIndex];
          const arcNeeded = currentTable.radius * 2 + currentTable.padding;
          const angleShare = (arcNeeded / totalCircumference) * 2 * Math.PI;
          const tableAngle = numGroups === 1 ? 0 : currentAngle + angleShare / 2;
          const tableX = numGroups === 1 ? centerX : centerX + Math.cos(tableAngle) * macroRadius;
          const tableY = numGroups === 1 ? centerY : centerY + Math.sin(tableAngle) * macroRadius;

          group.members.forEach((memberName: string, memberIndex: number) => {
            studentToGroupMap[memberName] = group.groupName || `Grupo ${groupIndex}`;
            const nodeIndex = newNodes.findIndex((n) => n.data.label === memberName);

            if (nodeIndex !== -1) {
              const studentAngle = (memberIndex / currentTable.numStudents) * 2 * Math.PI;
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                position: {
                  x: tableX + Math.cos(studentAngle) * currentTable.radius,
                  y: tableY + Math.sin(studentAngle) * currentTable.radius,
                },
              };
            }
          });
          currentAngle += angleShare;
        });
      }

      const newEdges = initialEdges.map((edge) => {
        const sourceNode = newNodes.find((n) => n.id === edge.source);
        const targetNode = newNodes.find((n) => n.id === edge.target);

        const isCrossGroup = suggestedGroups
          ? studentToGroupMap[sourceNode?.data.label as string] !== studentToGroupMap[targetNode?.data.label as string]
          : false;

        const failsTypeFilter = fType !== "ALL" && edge.data?.type !== fType;
        const failsContextFilter = fContext !== "ALL" && edge.data?.context !== fContext;
        
        // NUEVA REGLA: Ocultar la flecha si no pertenece a la encuesta seleccionada
        const failsFormFilter = formId !== "" ? edge.data?.formId !== formId : false;
        
        const isRelatedToFocus = focusId ? edge.source === focusId || edge.target === focusId : true;
        
        // Aplicamos el filtro de formulario aquí
        const isHidden = Boolean(isCrossGroup || failsTypeFilter || failsContextFilter || failsFormFilter);
        const opacity = !focusId || isRelatedToFocus ? 1 : 0.05;

        let handles = { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle };
        if (!isHidden && sourceNode && targetNode) {
          handles = getSmartHandles(sourceNode, targetNode);
        }

        return {
          ...edge,
          hidden: isHidden,
          style: { ...edge.style, opacity, transition: "opacity 0.3s" },
          animated: !isHidden && focusId === edge.source && edge.data?.type === "AFFINITY",
          ...handles, 
        };
      });

      const finalNodes = newNodes.map((node) => {
        // Un nodo está relacionado si es el focusId, o si tiene una flecha VIVA (no filtrada por formId) conectada al focusId.
        const isRelated = !focusId || node.id === focusId || newEdges.some((e) => 
          !e.hidden && ((e.source === focusId && e.target === node.id) || (e.target === focusId && e.source === node.id))
        );
        return {
          ...node,
          style: { ...node.style, opacity: isRelated ? 1 : 0.2, transition: "opacity 0.3s" },
        };
      });

      setNodes(finalNodes);
      setEdges(newEdges);
    },
    [initialNodes, initialEdges],
  );

  // El useEffect ahora reacciona a selectedFormId
  useEffect(() => {
    const tab = tabs.find((t) => t.id === activeTabId);
    applyLayout(tab?.groups || null, filterType, filterContext, focusedNodeId, selectedFormId);
  }, [activeTabId, filterType, filterContext, focusedNodeId, selectedFormId, tabs, applyLayout]);

  const handleApplyNewGroupsFromAi = (suggestedGroups: any[]) => {
    const numGroups = suggestedGroups.length;
    const newTabId = `tab-${Date.now()}`;
    const newTitle = `${numGroups} ${numGroups === 2 ? "Mitades" : numGroups === 1 ? "Grupo Único" : "Mesas"}`;

    setTabs((prev) => [...prev, { id: newTabId, title: newTitle, groups: suggestedGroups, type: "temp" }]);
    setActiveTabId(newTabId);
  };

  const removeTab = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabToDelete = tabs.find(t => t.id === id);
    if (!tabToDelete) return;

    if (tabToDelete.type === "saved") {
      const confirmDelete = window.confirm("⚠️ ¿Estás seguro de que quieres eliminar esta distribución permanentemente?");
      if (!confirmDelete) return;

      try {
        await deleteProjectDistribution(project.id, id);
        setTabs((prev) => prev.filter((tab) => tab.id !== id));
        if (activeTabId === id) setActiveTabId("full-class");
        router.refresh();
        return; 
      } catch (error) {
        alert("Error al borrar la distribución.");
        return;
      }
    }

    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTabId === id) setActiveTabId("full-class");
  };

  const isHistoricalTab = tabs.find(t => t.id === activeTabId)?.type === "saved";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-160px)] font-sans">
      <section className="xl:col-span-2 flex flex-col gap-4 h-full">
        
        {/* CABECERA CONECTADA AL SELECTOR DE ENCUESTAS */}
        <WorkspaceHeader 
          tabs={tabs}
          activeTabId={activeTabId}
          switchTab={setActiveTabId}
          removeTab={removeTab}
          
          filterType={filterType}
          setFilterType={setFilterType}
          filterContext={filterContext}
          setFilterContext={setFilterContext}
          
          forms={availableForms}
          selectedFormId={selectedFormId}
          setSelectedFormId={setSelectedFormId}

          isHistoricalTab={isHistoricalTab}
          isSaving={isSaving}
          savedTabId={savedTabId}
          onSaveDistribution={handleSaveDistribution}
        />

        {/* CONTENEDOR DEL GRAFO / INFORME */}
        <div className="flex-1 bg-white rounded-3xl border border-brand-slate/20 shadow-sm overflow-hidden relative">
          {activeTabId === "report" ? (
            <SociometricReport project={project} selectedFormId={selectedFormId} />
          ) : (
            <SociogramEditor
              initialNodes={nodes}
              initialEdges={edges}
              onNodeClick={(_: any, node: { id: string | null; }) => setFocusedNodeId((prev) => (prev === node.id ? null : node.id))}
              onPaneClick={() => setFocusedNodeId(null)}
            />
          )}
        </div>
      </section>

      {/* PANEL DEL ASISTENTE DE IA */}
      <aside className="xl:col-span-1 h-150 xl:h-auto">
        <AiAssistant
          projectId={project.id}
          onApplyGroups={handleApplyNewGroupsFromAi}
          selectedFormId={selectedFormId}
        />
      </aside>
    </div>
  );
}