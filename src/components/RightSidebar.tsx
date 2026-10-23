import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';

export const RightSidebar: React.FC = () => {
  const { nodes, setSelectedNodeId } = useContentStore();
  const { focusOnCoordinates } = useMapStore();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Ideias mais lidas da semana
  const mostRead = [...nodes]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const handleCardClick = (node: any) => {
    setSelectedNodeId(node.id);
    if (node.x !== undefined && node.y !== undefined) {
      focusOnCoordinates(node.x, node.y, 1.3);
    }
  };

  return (
    <aside className="w-80 h-full border-l border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md flex flex-col z-20 hidden lg:flex select-none">
      {/* Cabeçalho: Destaques da Semana */}
      <div className="px-4 pt-4 pb-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100">
              Destaques da Semana
            </h3>
            <p className="text-[10px] text-stone-400 font-mono">
              As ideias mais lidas da semana
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Cards: Fusão Prism 2 (Double Cascade 3 Camadas) + Prism 4 (Frosted Glass & Gradiente Difuso) */}
      <div className="flex-1 overflow-y-auto p-4 pr-5 space-y-4">
        {mostRead.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area];
          const isHovered = hoveredCardId === node.id;

          return (
            <div
              key={node.id}
              onMouseEnter={() => setHoveredCardId(node.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleCardClick(node)}
              className="relative cursor-pointer"
            >
              {/* 3ª Camada (Mais Profunda — Gradiente Difuso Prism 4 + Deslocamento 8px Prism 2) */}
              <div
                className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${areaTheme.accentColor} 0%, transparent 110%)`,
                  opacity: isHovered ? 0.45 : 0.08,
                  filter: isHovered ? 'blur(2.5px)' : 'blur(0.5px)',
                  transform: isHovered ? 'translate(8px, 8px)' : 'translate(3.5px, 3.5px)'
                }}
              />

              {/* 2ª Camada (Intermediária — Gradiente Luminoso Prism 4 + Deslocamento 4px Prism 2) */}
              <div
                className="absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${areaTheme.accentColor} 15%, ${areaTheme.glowColor} 100%)`,
                  opacity: isHovered ? 0.9 : 0.24,
                  filter: isHovered ? 'blur(0.5px)' : 'none',
                  transform: isHovered ? 'translate(4px, 4px)' : 'translate(1.8px, 1.8px)'
                }}
              />

              {/* 1ª Camada (Cartão Frontal em Vidro Fosco Prism 4 + Elevação Diagonal Prism 2) */}
              <div
                className="relative p-3.5 rounded-2xl border backdrop-blur-xl bg-white/90 dark:bg-[#0E131F]/90 transition-all duration-200"
                style={{
                  borderColor: isHovered ? areaTheme.accentColor : 'rgba(148, 163, 184, 0.16)',
                  transform: isHovered ? 'translate(-2px, -2px)' : 'none',
                  boxShadow: isHovered ? `0 8px 22px -8px ${areaTheme.glowColor}` : 'none'
                }}
              >
                {/* Tag de Principal Temática com Ponto Luminoso (Prism 4) + Pílula (Prism 2) */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-2 h-2 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: areaTheme.accentColor,
                      boxShadow: isHovered ? `0 0 8px ${areaTheme.accentColor}` : 'none',
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                  <span
                    className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[9px] transition-colors duration-200"
                    style={{
                      backgroundColor: isHovered ? areaTheme.accentColor : `${areaTheme.accentColor}18`,
                      color: isHovered ? '#FFFFFF' : areaTheme.accentColor
                    }}
                  >
                    {node.area}
                  </span>
                </div>

                {/* Título Editorial */}
                <h4
                  className="font-editorial text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug transition-colors duration-200"
                  style={isHovered ? { color: areaTheme.accentColor } : undefined}
                >
                  {node.title}
                </h4>

                {/* Rodapé: Autor e Número de Visitas */}
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mt-2.5 pt-2 border-t border-stone-200/40 dark:border-white/10">
                  <span className="truncate max-w-[130px]">{node.author.name}</span>
                  <span
                    className="font-semibold transition-colors duration-200"
                    style={isHovered ? { color: areaTheme.accentColor } : undefined}
                  >
                    {node.views} visitas
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
