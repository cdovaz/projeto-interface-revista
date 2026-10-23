import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useContentStore } from '../store/contentStore';

export const MapControls: React.FC = () => {
  const { zoom, setZoom, resetView } = useMapStore();
  const { nodes } = useContentStore();

  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-20 pointer-events-none select-none">
      {/* Indicador de Textos Disponíveis */}
      <div className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500 shadow-md flex items-center gap-2">
        <span>{nodes.length} - textos disponíveis</span>
      </div>

      {/* Controles de Zoom e Câmera */}
      <div className="flex flex-col rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-lg p-1 gap-1 pointer-events-auto">
        <button
          onClick={() => setZoom(zoom * 1.2)}
          className="p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Aproximar Zoom"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom(zoom / 1.2)}
          className="p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Afastar Zoom"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-px bg-stone-200 dark:bg-stone-800 mx-1" />

        <button
          onClick={resetView}
          className="p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Centralizar Universo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
