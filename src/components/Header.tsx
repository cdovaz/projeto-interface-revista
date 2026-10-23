import React from 'react';
import { Search, Compass, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useContentStore } from '../store/contentStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme, setCreateModalOpen, resetView } = useMapStore();
  const {
    searchQuery,
    setSearchQuery,
    focusMode,
    toggleFocusMode
  } = useContentStore();

  return (
    <header className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Título Simplificado para 'Interface' */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetView}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-editorial text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Interface
          </span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Ações e Controles */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleFocusMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            focusMode
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
          }`}
          title="Modo Foco"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Modo Foco</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Ideia</span>
        </button>
      </div>
    </header>
  );
};
