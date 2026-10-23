import React from 'react';
import { 
  Compass,
  User, 
  Settings, 
  FileText, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useMapStore } from '../store/mapStore';

export const LeftSidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, activeScreen, setActiveScreen } = useMapStore();

  return (
    <aside
      className={`relative h-full border-r border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md flex flex-col transition-all duration-300 z-20 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Botão de Retração */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:scale-110 transition-transform shadow-sm z-30"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {sidebarOpen ? (
        <div className="flex flex-col h-full p-4">
          {/* Lista Vertical Simples de Botões */}
          <div className="space-y-1.5 select-none">
            <button
              onClick={() => setActiveScreen('navegar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeScreen === 'navegar'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Navegar</span>
            </button>

            <button
              onClick={() => setActiveScreen('perfil')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeScreen === 'perfil'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Perfil</span>
            </button>

            <button
              onClick={() => setActiveScreen('posts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeScreen === 'posts'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Meus Posts</span>
            </button>

            <button
              onClick={() => setActiveScreen('configuracoes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeScreen === 'configuracoes'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      ) : (
        /* Visual Colapsado: Ícones Verticais */
        <div className="flex flex-col items-center py-6 space-y-4">
          <button 
            onClick={() => setActiveScreen('navegar')}
            className={`p-2.5 rounded-xl transition-all ${
              activeScreen === 'navegar' 
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Navegar"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveScreen('perfil')}
            className={`p-2.5 rounded-xl transition-all ${
              activeScreen === 'perfil' 
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Perfil"
          >
            <User className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveScreen('posts')}
            className={`p-2.5 rounded-xl transition-all ${
              activeScreen === 'posts' 
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Meus Posts"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveScreen('configuracoes')}
            className={`p-2.5 rounded-xl transition-all ${
              activeScreen === 'configuracoes' 
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' 
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
