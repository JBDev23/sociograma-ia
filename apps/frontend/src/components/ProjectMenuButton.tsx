// apps/frontend/src/components/ProjectMenuButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/api";

export default function ProjectMenuButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`⚠️ ¿Eliminar "${projectName}"?`)) {
      setIsDeleting(true);
      try {
        await deleteProject(projectId);
        setIsOpen(false);
        router.refresh();
      } catch (error) {
        alert("Error al borrar.");
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    router.push(`/projects/${projectId}/edit`);
  };

  return (
    <div className="relative z-30" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        disabled={isDeleting}
        className={`p-2 rounded-full transition-colors ${
          isOpen ? "bg-brand-cream text-brand-dark" : "text-brand-slate hover:bg-brand-cream/50 hover:text-brand-dark"
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-slate/15 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
          <button 
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-cream/50 transition-colors"
          >
            <Edit2 size={16} className="text-brand-slate" />
            Editar clase
          </button>
          
          <div className="w-full h-px bg-brand-slate/10" />
          
          <button 
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}