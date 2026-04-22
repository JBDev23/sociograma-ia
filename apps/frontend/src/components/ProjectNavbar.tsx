// src/components/ProjectNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Users, Network, Map } from "lucide-react";

export default function ProjectNavbar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  const tabs = [
    { id: "students", label: "Alumnos", path: `/projects/${projectId}/students`, icon: Users },
    { id: "sociograms", label: "Sociogramas", path: `/projects/${projectId}/sociograms`, icon: Network },
    { id: "layout", label: "Diseño del Aula", path: `/projects/${projectId}/layout`, icon: Map },
  ];

  return (
  <div className="sticky top-16 z-40 bg-brand-cream/90 backdrop-blur-md pt-6 -mt-6 mb-8 font-sans shadow-sm">      <div className="border-b border-brand-slate/20">
        <div className="flex gap-8 px-6 max-w-400 mx-auto">
          {tabs.map((tab) => {
            const isActive = pathname.includes(tab.path);
            const Icon = tab.icon;
            
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`group flex items-center gap-2.5 pb-3.5 px-1 text-sm font-semibold transition-all border-b-2 relative -mb-px ${
                  isActive
                    ? "text-brand-orange border-brand-orange"
                    : "text-brand-slate border-transparent hover:text-brand-dark hover:border-brand-slate/30"
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors ${isActive ? "text-brand-orange" : "text-brand-slate group-hover:text-brand-dark"}`} 
                />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}