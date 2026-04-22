// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Network, Sparkles, ArrowRight, ShieldAlert, Users, LayoutDashboard, Loader2, Play } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // La transición mágica para la demo
  const handleStartDemo = () => {
    setIsLoading(true);
    // Simulamos carga y redirigimos al dashboard real
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand-cream/30 font-sans selection:bg-brand-orange/20 selection:text-brand-orange overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="w-full border-b border-brand-slate/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-orange/20">
              S
            </div>
            <span className="font-bold text-2xl tracking-tight text-brand-dark">Sociograma IA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-brand-slate text-sm">
            <a href="#features" className="hover:text-brand-orange transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-brand-orange transition-colors">Cómo funciona</a>
            <button 
              onClick={handleStartDemo}
              className="px-6 py-2.5 bg-brand-dark text-white rounded-xl hover:bg-black transition-colors"
            >
              Acceso Profesores
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-[1200px] mx-auto px-6 pt-20 md:pt-32 pb-20 relative">
        {/* Efectos de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 -z-10" />

        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-sm mb-8">
            <Sparkles size={16} />
            La revolución en la gestión del aula
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-brand-dark leading-[1.1] mb-8 tracking-tight">
            Descubre la <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500">red invisible</span> de tu clase.
          </h1>

          <p className="text-lg md:text-xl text-brand-slate font-medium mb-10 leading-relaxed max-w-[600px]">
            Evalúa el clima social, detecta el acoso de forma temprana y deja que la Inteligencia Artificial organice las mesas de trabajo por ti en segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleStartDemo}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-brand-orange text-white font-bold rounded-2xl hover:bg-[#e66a17] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/20 active:scale-[0.98] text-lg"
            >
              {isLoading ? (
                <><Loader2 size={24} className="animate-spin" /> Preparando entorno...</>
              ) : (
                <>Probar Demo Interactiva <ArrowRight size={20} /></>
              )}
            </button>
            <button 
              onClick={() => alert("¡Aquí podrías poner un vídeo de cómo funciona la app!")}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-brand-slate/15 text-brand-dark font-bold rounded-2xl hover:bg-brand-cream/50 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Play size={20} className="fill-brand-dark" /> Ver vídeo
            </button>
          </div>
        </div>

        {/* MOCKUP VISUAL (Opcional, queda genial) */}
        <div className="mt-20 relative mx-auto max-w-250 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="aspect-video w-full rounded-3xl bg-white border border-brand-slate/20 shadow-2xl overflow-hidden relative flex items-center justify-center">
            
            {/* LA IMAGEN */}
            <Image 
              src="/hero-mockup.png" 
              alt="Sociograma IA Dashboard" 
              fill
              className="object-cover object-top"
              priority
              sizes=""
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand-dark/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-mono text-sm shadow-2xl flex items-center gap-3 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Análisis completado
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-white py-24 border-t border-brand-slate/10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">Mucho más que encuestas</h2>
            <p className="text-brand-slate font-medium max-w-[600px] mx-auto">
              Todo lo que necesitas para entender las dinámicas de tu grupo y tomar decisiones respaldadas por datos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-brand-cream/30 p-8 rounded-[2rem] border border-brand-slate/15 hover:border-brand-orange/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Network size={28} className="text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Sociogramas Vivos</h3>
              <p className="text-brand-slate leading-relaxed font-medium text-sm">
                Visualiza las afinidades y conflictos en tiempo real. Filtra por contexto (trabajo u ocio) y descubre la estructura real de tu aula.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-brand-cream/30 p-8 rounded-[2rem] border border-brand-slate/15 hover:border-brand-orange/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Asistente IA</h3>
              <p className="text-brand-slate leading-relaxed font-medium text-sm">
                Pide a la IA que genere grupos equitativos, que separe a los alumnos conflictivos o que integre a los aislados con un solo clic.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-brand-cream/30 p-8 rounded-[2rem] border border-brand-slate/15 hover:border-brand-orange/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Prevención Temprana</h3>
              <p className="text-brand-slate leading-relaxed font-medium text-sm">
                Los informes automatizados detectan instantáneamente alumnos en riesgo de exclusión o posibles focos de acoso escolar.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}