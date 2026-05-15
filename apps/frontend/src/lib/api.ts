// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const DEMO_SECRET = process.env.NEXT_PUBLIC_DEMO_SECRET || '';

export async function getProjectData(projectId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Error al obtener el proyecto');
 
  return response.json();
}

export async function getProjects(userId: string, query?: string, sort?: string) {
  try {
    // Construimos los parámetros de la URL
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (sort) params.append('sort', sort);

    const queryString = params.toString();
    const url = `${API_URL}/projects/user/${userId}${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) throw new Error('Error cargando proyectos');
    return await res.json();
  } catch (error) {
    console.error("Error getProjects:", error);
    return [];
  }
}

export async function createProject(data: { title: string; description?: string; ownerId: string }) {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}` // Aquí irá tu token JWT en el futuro
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error al crear el proyecto en el servidor");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createProject:", error);
    throw error; // Lanzamos el error para que el componente (la vista) lo maneje
  }
}

export async function updateProject(projectId: string, data: { title?: string; description?: string }) {
  try {
    const res = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Error al actualizar el proyecto");
    }

    return await res.json();
  } catch (error) {
    console.error("Error en updateProject:", error);
    throw error;
  }
}

export async function deleteProject(projectId: string) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "DELETE",
      // headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el proyecto");
    }

    return true;
  } catch (error) {
    console.error("Error en deleteProject:", error);
    throw error;
  }
}

export async function getMembers(projectId: string): Promise<Member[]> {
  const res = await fetch(`${API_URL}/members/project/${projectId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar alumnos");
  return res.json();
}

export async function addMember(projectId: string, name: string): Promise<Member> {
  const res = await fetch(`${API_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, name }),
  });
  return res.json();
}

export async function deleteMember(memberId: string) {
  return fetch(`${API_URL}/members/${memberId}`, { method: "DELETE" });
}

// --- FORMULARIOS ---
export async function getFormById(formId: string) {
  const res = await fetch(`${API_URL}/forms/${formId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar el formulario");
  return res.json();
}

export async function updateForm(formId: string, data: any) {
  const res = await fetch(`${API_URL}/forms/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el formulario");
  return res.json();
}

export async function getFormsByProject(projectId: string) {
  const res = await fetch(`${API_URL}/forms/project/${projectId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar los formularios");
  return res.json();
}

export async function getAllForms(userId: string, query?: string, sort?: string) {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (sort) params.append('sort', sort);

  const queryString = params.toString();
  const url = `${API_URL}/forms/user/${userId}${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar todos los formularios");
  return res.json();
}

export async function createForm(data: { title: string; projectId: string; deadline?: string }) {
  const res = await fetch(`${API_URL}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el formulario");
  return res.json();
}

export async function deleteForm(formId: string) {
  const res = await fetch(`${API_URL}/forms/${formId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al borrar el formulario");
  return res.json();
}

export async function getPublicForm(formId: string) {

  const res = await fetch(`${API_URL}/forms/${formId}/public`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar la encuesta");
  return res.json();
}

export async function getFormResults(formId: string) {
  const res = await fetch(`${API_URL}/forms/${formId}/results`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Error al cargar los resultados de la encuesta");
  return res.json();
}

export async function submitSurvey(formId: string, data: {
  memberId: string;
  responses: { toId: string; type: string; context: string; weight: number }[]
}) {
  const res = await fetch(`${API_URL}/forms/${formId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al enviar la encuesta");
  }
  return res.json();
}

export async function getAiGroupProposal(projectId: string, prompt: string, numGroups?: number, formId?: string) {
  const response = await fetch(`${API_URL}/ai/project/${projectId}/group`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-demo-secret': DEMO_SECRET
    },
    body: JSON.stringify({ prompt, numGroups, formId }),
  });

  console.error(response.status)

  if (response.status === 429) {
    throw new Error("LIMITE_IA_ALCANZADO");
  }

  if (!response.ok) throw new Error('Error al obtener respuesta de la IA');
  
  return response.json(); 
}

import { Member } from "@sociograma/shared";
import { Node } from "@xyflow/react";
import { error } from "console";

export const distributeStudentsWithAI = async (
  nodes: Node[],
  unassigned: string[]
): Promise<Node[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Clonamos la lista de alumnos sin asignar para ir consumiéndola
      let pool = [...unassigned];
      
      const newNodes = nodes.map(node => {
        const data = node.data as any;
        
        // 1. Calculamos la capacidad real según el tipo de mesa
        const cap = data.shape === "rectangle" 
          ? data.rectSeats.top + data.rectSeats.bottom + data.rectSeats.left + data.rectSeats.right 
          : data.capacity;
        
        // 2. Construimos un array exacto de 'cap' posiciones, respetando a los que ya están sentados
        let currentStudents = Array.from({ length: cap }, (_, index) => {
          return (data.students && data.students[index]) ? data.students[index] : null;
        });
        
        // 3. Rellenamos los huecos vacíos de esta mesa
        for (let i = 0; i < currentStudents.length; i++) {
          // Si la silla está vacía (null) y aún nos quedan alumnos en el pool
          if (currentStudents[i] === null && pool.length > 0) {
            // Sacamos al primer alumno del pool y lo sentamos
            currentStudents[i] = pool.shift()!;
          }
        }
        
        // Devolvemos el nodo con la nueva lista de estudiantes
        return { ...node, data: { ...data, students: currentStudents } };
      });
      
      resolve(newNodes);
    }, 1500); // Simulamos 1.5s de latencia
  });
};

export async function saveProjectDistribution(projectId: string, name: string, groups: any[]) {
  const response = await fetch(`${API_URL}/projects/${projectId}/distribution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name, 
      groups, 
      setActive: true 
    }),
  });

  if (!response.ok) throw new Error('Error al guardar la plantilla');
  return response.json();
}

export async function deleteProjectDistribution(projectId: string, distributionId: string) {
  const response = await fetch(`${API_URL}/projects/${projectId}/distribution/${distributionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('No se pudo eliminar la distribución');
  return response.json();
}

export async function redistributeWithAI(projectId: string, tablesConfig: { id: string, capacity: number }[], formId?: string) {
  const url = `${API_URL}/ai/project/${projectId}/redistribute`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-demo-secret': DEMO_SECRET
    },
    body: JSON.stringify({ tablesConfig, formId }),
  });

  if (!response.ok) throw new Error('Fallo en la redistribución inteligente');
  
  return response.json();
}

export async function saveProjectClassroomLayout(
  projectId: string, 
  layoutData: { id?: string; name: string; nodes: any[] }
) {
  const url = `${API_URL}/projects/${projectId}/layout`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layoutData),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar el plano en la biblioteca');
  }

  return response.json();
}

function getRelativeTime(dateString: string | Date) {
  const date = new Date(dateString);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) {
    const hoursDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
    return hoursDifference === 0 ? "hace un momento" : rtf.format(hoursDifference, 'hour');
  }
  return rtf.format(daysDifference, 'day');
}

export async function getDashboardStats(userId: string) {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats/${userId}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Error fetching stats from NestJS');
    }

    const data = await res.json();

    // Transformamos las fechas devueltas por Nest a texto legible ("hace 2 horas")
    const formattedRecentProjects = data.recentProjects.map((project: any) => ({
      ...project,
      lastActivity: getRelativeTime(project.updatedAt)
    }));

    return {
      stats: data.stats,
      recentProjects: formattedRecentProjects
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return { stats: { students: 0, projects: 0, forms: 0 }, recentProjects: [] };
  }
}

export async function importMembersBulk(projectId: string, names: string[]) {
  const response = await fetch(`${API_URL}/projects/${projectId}/members/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  });

  if (!response.ok) {
    throw new Error('Error al importar los alumnos en bloque');
  }
  
  return response.json();
}

export async function resetDatabase() {
  const response = await fetch(`${API_URL}/admin/reset-db`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-demo-secret': DEMO_SECRET
    },
  });

  if (!response.ok) throw new Error('Error al resetear la base de datos');
  return response.json();
}

export async function pingBackend() {
  try {
    // Hacemos una petición rápida a la raíz para forzar el cold start
    await fetch(`${API_URL}/`, { cache: 'no-store' });
  } catch (error) {
    // Ignoramos errores, el objetivo es solo despertar la máquina
    console.log("Ping al backend enviado");
  }
}