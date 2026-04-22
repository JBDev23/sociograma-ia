// src/components/SociogramEditor.tsx
'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  NodeChange, 
  EdgeChange, 
  Node, 
  Edge, 
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow 
} from '@xyflow/react';
import MemberNode from './MemberNode';

interface SociogramEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void; 
  onPaneClick: (event: React.MouseEvent) => void;
}

// 1. EL LIENZO INTERNO (Ahora tiene acceso a la cámara)
function FlowCanvas({ initialNodes, initialEdges, onNodeClick, onPaneClick }: SociogramEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  
  // Función para mover la cámara
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({ member: MemberNode }), []);

  // Sincronizamos cuando el padre manda nuevos grupos
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2, minZoom: 0.05 }); 
    }, 50);

  }, [initialNodes, initialEdges, fitView]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <ReactFlow 
      nodes={nodes} 
      edges={edges} 
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange} 
      onEdgesChange={onEdgesChange} 
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      minZoom={0.05}
      maxZoom={2}
      fitView
      className="bg-brand-cream/10"
    >
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={24} 
        size={1.5} 
        color="var(--color-brand-slate)" 
        className="opacity-20" 
      />
      <Controls className="fill-brand-dark border-brand-slate/20 shadow-md rounded-xl overflow-hidden" />
    </ReactFlow>
  );
}

// 2. EL COMPONENTE PADRE EXPORTADO
export default function SociogramEditor(props: SociogramEditorProps) {
  return (
    <div className="w-full h-full relative font-sans">
      
      {/* Se han ajustado los colores ligeramente para que combinen mejor con la nueva paleta */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
          </marker>
          <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-brand-orange)" />
          </marker>
        </defs>
      </svg>

      {/* ENVOLVEMOS EL LIENZO EN EL PROVIDER */}
      <ReactFlowProvider>
        <FlowCanvas {...props} />
      </ReactFlowProvider>

    </div>
  );
}