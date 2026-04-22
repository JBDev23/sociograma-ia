// src/components/GlobalHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FolderKanban, FileText, 
  Settings, Bell, LogOut, User, CheckCircle2, 
  RefreshCcw
} from "lucide-react";
import { resetDatabase } from "@/lib/api";

export default function GlobalHeader() {
  const pathname = usePathname();

  // Estados para los menús desplegables
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Referencia para detectar clics fuera del menú
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Inicio", path: "/dashboard", icon: LayoutDashboard },
    { name: "Proyectos", path: "/projects", icon: FolderKanban },
    { name: "Formularios", path: "/forms", icon: FileText },
  ];

  if(pathname=="/") return

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-dark text-white shadow-md font-sans">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO Y NAVEGACIÓN PRINCIPAL */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="font-bold text-lg tracking-tight">Weavy IA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive 
                      ? "bg-white/10 text-brand-orange" 
                      : "text-brand-slate hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-brand-orange" : "text-brand-slate"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACCIONES DE USUARIO (DERECHA) */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          
          {/* BOTÓN NOTIFICACIONES */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className={`p-2 transition-colors relative rounded-lg ${showNotifications ? 'bg-white/10 text-white' : 'text-brand-slate hover:text-white'}`}
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full border border-brand-dark"></span>
            </button>

            {/* DROPDOWN NOTIFICACIONES */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brand-slate/15 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-brand-slate/10 flex justify-between items-center bg-brand-cream/30">
                  <span className="text-sm font-bold text-brand-dark">Notificaciones</span>
                  <span className="text-[10px] font-bold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">2 Nuevas</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {/* Ejemplo de Notificación 1 */}
                  <div className="px-4 py-3 hover:bg-brand-cream/50 transition-colors border-b border-brand-slate/5 cursor-pointer flex gap-3 items-start">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-brand-orange shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark leading-tight">4 alumnos han completado la encuesta</p>
                      <p className="text-xs text-brand-slate mt-1 font-medium">Proyecto: 4º ESO - Sociograma Anual</p>
                      <p className="text-[10px] text-brand-slate mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                  {/* Ejemplo de Notificación 2 */}
                  <div className="px-4 py-3 hover:bg-brand-cream/50 transition-colors cursor-pointer flex gap-3 items-start opacity-75">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-transparent border border-brand-slate shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark leading-tight">Nuevo informe de IA disponible</p>
                      <p className="text-xs text-brand-slate mt-1 font-medium">Sugerencia de mesas generada con éxito.</p>
                      <p className="text-[10px] text-brand-slate mt-1">Ayer</p>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 text-xs font-bold text-brand-orange hover:bg-brand-orange/5 transition-colors border-t border-brand-slate/10">
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN AJUSTES (Ahora es un Link) */}
          <Link 
            href="/settings"
            className="p-2 text-brand-slate hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Ajustes"
          >
            <Settings size={18} />
          </Link>
          
          <div className="w-px h-6 bg-brand-slate/30 mx-1"></div>
          
          {/* BOTÓN AVATAR / PERFIL */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className={`flex items-center gap-2 transition-all p-1 rounded-full border-2 ${showProfileMenu ? 'border-brand-orange' : 'border-transparent hover:border-white/20'}`}
            >
              <div className="w-8 h-8 bg-brand-cream text-brand-dark rounded-full flex items-center justify-center font-bold text-xs font-mono">
                JD
              </div>
            </button>

            {/* DROPDOWN PERFIL */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-brand-slate/15 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-brand-slate/10 bg-brand-cream/30">
                  <p className="text-sm font-bold text-brand-dark">Profesor Martínez</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-cream/50 transition-colors">
                    <User size={16} /> Mi Perfil
                  </Link>
                  
                  {/* EL BOTÓN DE RESET */}
                  <button 
                    onClick={async () => {
                      if(confirm("⚠️ ¿Estás seguro? Esto borrará todos los cambios de la demo actual.")) {
                        try {
                          await resetDatabase();
                          window.location.reload();
                        } catch (e) {
                          alert("Error al resetear");
                        }
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors border-t border-brand-slate/5"
                  >
                    <RefreshCcw size={16} /> Resetear Demo
                  </button>

                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}