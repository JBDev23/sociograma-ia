// src/lib/flow-utils.ts
import { Node, Edge } from '@xyflow/react';
import { ProjectWithDetails } from '@sociograma/shared';

export function transformProjectToFlow(project: ProjectWithDetails) {
  // 1. Posicionamos los nodos (Círculo más grande para 20 personas)
  const nodes: Node[] = project.members.map((member, index) => {
    const angle = (index / project.members.length) * 2 * Math.PI;
    const radius = project.members.length * 25; 
    return {
      id: member.id,
      type: 'member',
      position: {
        x: Math.cos(angle) * radius + 500,
        y: Math.sin(angle) * radius + 400,
      },
      data: { label: member.name },
    };
  });

  // 2. Calculamos las líneas y sus estilos según el Contexto y el Tipo
  const edges: Edge[] = project.relationships.map((rel) => {
    // Definir la dimensión (Trabajo u Ocio) y si es positivo o negativo
    const isWork = rel.context === 'WORK';
    const isAffinity = rel.type === 'AFFINITY';

    // Lógica de Colores sincronizada con los <marker> de SociogramEditor.tsx
    let color = '#000';
    let markerId = '';

    if (isWork) {
      // TRABAJO: Verde esmeralda (Afinidad) y Rojo (Conflicto)
      color = isAffinity ? '#10b981' : '#f43f5e';
      markerId = isAffinity ? 'arrow-green' : 'arrow-red';
    } else {
      // OCIO: Azul cian (Afinidad) y Naranja corporativo (Conflicto)
      color = isAffinity ? '#0ea5e9' : '#ff771c';
      markerId = isAffinity ? 'arrow-blue' : 'arrow-orange';
    }

    // El grosor depende del peso (1ª opción = 3, 2ª = 2, 3ª = 1)
    // Si no viene peso, por defecto 2.
    const thickness = rel.weight ? rel.weight + 1 : 2;

    // --- Enrutamiento Inteligente (Smart Routing) ---
    const sourceNode = nodes.find(n => n.id === rel.fromId);
    const targetNode = nodes.find(n => n.id === rel.toId);

    let sourceHandle = 's-bottom';
    let targetHandle = 't-top';

    if (sourceNode && targetNode) {
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) { sourceHandle = 's-right'; targetHandle = 't-left'; } 
        else        { sourceHandle = 's-left'; targetHandle = 't-right'; }
      } else {
        if (dy > 0) { sourceHandle = 's-bottom'; targetHandle = 't-top'; } 
        else        { sourceHandle = 's-top'; targetHandle = 't-bottom'; }
      }
    }

    return {
      id: rel.id,
      source: rel.fromId,
      target: rel.toId,
      sourceHandle,
      targetHandle,
      type: 'default',
      
      data: {
        type: rel.type,
        context: rel.context,
        formId: rel.formId,
      },
      
      style: {
        stroke: color,
        strokeWidth: thickness,
        strokeDasharray: !isWork ? '6,6' : undefined, 
      },
      animated: false,
      interactionWidth: 0,
      markerEnd: markerId,
    };
  });

  return { nodes, edges };
}