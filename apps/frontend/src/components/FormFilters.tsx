"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export default function FormFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q")?.toString() || "");
  const [sortParam, setSortParam] = useState(searchParams.get("sort")?.toString() || "newest");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchTerm) params.set("q", searchTerm);
      else params.delete("q");

      if (sortParam && sortParam !== "newest") params.set("sort", sortParam);
      else params.delete("sort");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, sortParam, pathname, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-brand-orange animate-pulse' : 'text-brand-slate/50'}`} size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título de encuesta o clase..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-brand-slate/15 rounded-2xl text-sm font-medium outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
        />
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate pointer-events-none">
          <ArrowUpDown size={16} />
        </div>
        <select
          value={sortParam}
          onChange={(e) => setSortParam(e.target.value)}
          className="appearance-none h-full pl-11 pr-10 py-3 bg-white border border-brand-slate/15 text-brand-dark font-semibold rounded-2xl hover:bg-brand-cream/30 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm shadow-sm cursor-pointer outline-none"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="az">Alfabético (A-Z)</option>
          <option value="za">Alfabético (Z-A)</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-brand-slate/20 pl-2 text-brand-slate">
          ▼
        </div>
      </div>
    </div>
  );
}