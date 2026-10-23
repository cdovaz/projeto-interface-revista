import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import * as d3Delaunay from 'd3-delaunay';
import { Sparkles, Layers, Compass, Activity, Eye, Zap } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export type VoronoiVariantId = 1 | 2 | 3 | 4 | 5 | 6;

interface VariantInfo {
  id: VoronoiVariantId;
  title: string;
  badge: string;
  desc: string;
}

const VORONOI_VARIANTS: VariantInfo[] = [
  {
    id: 1,
    title: '1. V3 Original (Auras & Células Voronoi Suaves)',
    badge: 'Voronoi Clássico + Auras',
    desc: 'Células de Voronoi com bordas finas semi-translúcidas e auras radiais de calor temático ao redor de cada área científica.'
  },
  {
    id: 2,
    title: '2. Mosaico de Territórios Voronoi Preenchidos',
    badge: 'Mosaico de Vidro / Polígonos de Área',
    desc: 'Cada nó gera uma célula poligonal preenchida com gradiente sutil de vidro na cor da ciência, iluminando o território ao passar o mouse.'
  },
  {
    id: 3,
    title: '3. Mapa de Calor Topográfico (Curvas de Nível Contínuas)',
    badge: 'Curvas Isométricas / Topografia Viva',
    desc: 'Anéis topográficos concêntricos que delimitam a densidade de ideias e proximidade temática como um mapa de relevo geográfico.'
  },
  {
    id: 4,
    title: '4. Voronoi Bio-Orgânico & Pontes Sinápticas',
    badge: 'Células Arredondadas + Feixes Coloridos',
    desc: 'Polígonos com cantos suavizados e conexões com gradiente luminoso vivo que pulsam ao cruzar as fronteiras das células.'
  },
  {
    id: 5,
    title: '5. Cartografia Noturna Neon (Bordas de Nanquim & Glow)',
    badge: 'Linhas Voronoi Neon + Fundo Profundo',
    desc: 'Fronteiras poligonais em linhas de laser neon brilhantes com nós flutuando como núcleos de energia em cada célula.'
  },
  {
    id: 6,
    title: '6. Voronoi Interativo de Destaque Territorial (Hover Focus)',
    badge: 'Foco de Domínio + Iluminação do Território',
    desc: 'Ao passar o mouse sobre qualquer esfera, a célula de Voronoi e todas as células vizinhas conectadas acendem em destaque com o nome do território.'
  }
];

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);
  const [activeVariant, setActiveVariant] = useState<VoronoiVariantId>(1);

  const {
    nodes,
    connections,
    selectedNodeId,
    setSelectedNodeId,
    activeAreaFilter,
    searchQuery,
    focusMode,
    explorationTrail
  } = useContentStore();

  const { zoom, setZoom, pan, setPan, theme } = useMapStore();

  const isDraggingMapRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const draggedNodeIdRef = useRef<string | null>(null);
  const didMoveNodeRef = useRef(false);

  const simNodesRef = useRef<any[]>([]);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  const getThematicSimilarity = (a: any, b: any): number => {
    let score = 0;
    if (a.area === b.area) score += 0.5;
    if (a.subtopic === b.subtopic) score += 0.25;
    const sharedTags = (a.tags || []).filter((t: string) => (b.tags || []).includes(t)).length;
    score += Math.min(0.25, sharedTags * 0.12);
    return Math.min(1, score);
  };

  useEffect(() => {
    const simulationNodes = nodes.map((n) => {
      const existing = simNodesRef.current.find((s) => s.id === n.id);
      const areaTheme = SCIENTIFIC_AREAS[n.area];
      return {
        ...n,
        x: existing?.x ?? areaTheme.center.x + (Math.random() - 0.5) * 140,
        y: existing?.y ?? areaTheme.center.y + (Math.random() - 0.5) * 140,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        fx: existing?.fx ?? null,
        fy: existing?.fy ?? null,
        targetX: areaTheme.center.x,
        targetY: areaTheme.center.y
      };
    });

    simNodesRef.current = simulationNodes;
    const nodeById = new Map(simulationNodes.map((n) => [n.id, n]));

    const explicitLinks = connections
      .map((c) => {
        const src = nodeById.get(typeof c.source === 'object' ? (c.source as any).id : c.source);
        const tgt = nodeById.get(typeof c.target === 'object' ? (c.target as any).id : c.target);
        if (!src || !tgt) return null;
        const sim = getThematicSimilarity(src, tgt);
        return {
          ...c,
          source: src.id,
          target: tgt.id,
          similarity: sim,
          targetDistance: 175 - sim * 115,
          linkStrength: 0.35 + sim * 0.45
        };
      })
      .filter(Boolean) as any[];

    const thematicForce = (alpha: number) => {
      const len = simulationNodes.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const a = simulationNodes[i];
          const b = simulationNodes[j];
          const sim = getThematicSimilarity(a, b);
          if (sim <= 0) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 180 - sim * 115;

          if (dist > idealDist) {
            const k = ((dist - idealDist) / dist) * sim * 0.045 * alpha;
            const fx = dx * k;
            const fy = dy * k;
            if (a.fx == null) {
              a.vx += fx;
              a.vy += fy;
            }
            if (b.fx == null) {
              b.vx -= fx;
              b.vy -= fy;
            }
          }
        }
      }
    };

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force('charge', d3.forceManyBody().strength(-115))
      .force('collide', d3.forceCollide().radius(28).strength(0.9))
      .force(
        'link',
        d3
          .forceLink(explicitLinks)
          .id((d: any) => d.id)
          .distance((d: any) => d.targetDistance)
          .strength((d: any) => d.linkStrength)
      )
      .force('thematic', thematicForce)
      .force('x', d3.forceX((d: any) => d.targetX).strength(0.16))
      .force('y', d3.forceY((d: any) => d.targetY).strength(0.16))
      .alphaDecay(0.025);

    simulation.on('tick', () => {
      setTick((t) => (t + 1) % 1000000);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, connections]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const screenToWorld = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - containerSize.width / 2 - pan.x) / zoom,
      y: (sy - containerSize.height / 2 - pan.y) / zoom
    };
  };

  const handleMouseDownMap = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingMapRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeIdRef.current) {
      didMoveNodeRef.current = true;
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const node = simNodesRef.current.find((n) => n.id === draggedNodeIdRef.current);
      if (node) {
        node.fx = worldPos.x;
        node.fy = worldPos.y;
        node.x = worldPos.x;
        node.y = worldPos.y;
        simulationRef.current?.alpha(0.35).restart();
      }
      return;
    }

    if (!isDraggingMapRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    if (draggedNodeIdRef.current) {
      const node = simNodesRef.current.find((n) => n.id === draggedNodeIdRef.current);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      draggedNodeIdRef.current = null;
    }
    isDraggingMapRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(zoom * zoomFactor);
  };

  const filteredNodes = simNodesRef.current.filter((n) => {
    if (activeAreaFilter && n.area !== activeAreaFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchAuthor = n.author.name.toLowerCase().includes(q);
      const matchTags = n.tags?.some((t: string) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }
    return true;
  });

  const visibleNodeMap = new Map<string, any>();
  filteredNodes.forEach((n) => visibleNodeMap.set(n.id, n));

  // Cálculo das Células de Voronoi em tempo real
  const voronoiPolygons: { node: any; path: string; center: [number, number] }[] = [];
  if (filteredNodes.length >= 3) {
    const points: [number, number][] = filteredNodes.map((n) => [n.x ?? 0, n.y ?? 0]);
    const bounds: [number, number, number, number] = [-700, -500, 700, 500];
    const delaunay = d3Delaunay.Delaunay.from(points);
    const voronoi = delaunay.voronoi(bounds);

    for (let i = 0; i < filteredNodes.length; i++) {
      const path = voronoi.renderCell(i);
      if (path) {
        voronoiPolygons.push({
          node: filteredNodes[i],
          path,
          center: points[i]
        });
      }
    }
  }

  // Centros de área para auras de fundo
  const areaCenters = Object.entries(SCIENTIFIC_AREAS).map(([area, config]) => ({
    area: area as ScientificArea,
    x: config.center.x,
    y: config.center.y,
    color: config.accentColor,
    glow: config.glowColor
  }));

  // IDs de vizinhos conectados ao nó sob hover para o Modo 6
  const neighborIds = new Set<string>();
  if (hoveredNodeId) {
    neighborIds.add(hoveredNodeId);
    connections.forEach((conn) => {
      const srcId = typeof conn.source === 'object' ? (conn.source as any).id : conn.source;
      const tgtId = typeof conn.target === 'object' ? (conn.target as any).id : conn.target;
      if (srcId === hoveredNodeId) neighborIds.add(tgtId);
      if (tgtId === hoveredNodeId) neighborIds.add(srcId);
    });
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-500 ${
        activeVariant === 5
          ? 'bg-[#03060E] text-stone-100'
          : 'bg-stone-100 dark:bg-[#070A10]'
      }`}
      onMouseDown={handleMouseDownMap}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* =========================================================================
          SELETOR DE 6 VARIAÇÕES DE CAMPOS DE VORONOI
      ========================================================================== */}
      <div className="absolute top-4 left-6 z-40 max-w-4xl pointer-events-auto">
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#0C111C]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                6 Variações de Campos de Voronoi (Navegar)
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              {VORONOI_VARIANTS.find((v) => v.id === activeVariant)?.desc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {VORONOI_VARIANTS.map((variant) => {
              const active = activeVariant === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVariant(variant.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5'
                  }`}
                >
                  <span>V{variant.id}</span>
                  <span className="hidden md:inline font-normal opacity-85 text-[10px]">
                    {variant.badge.split('+')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          PLANO DE COORDENADAS UNIFICADO DO GRAFO
      ========================================================================== */}
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          transform: `translate3d(${containerSize.width / 2 + pan.x}px, ${
            containerSize.height / 2 + pan.y
          }px, 0) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* =================== AURAS RADIAIS TOPOLÓGICAS (MODOS 1, 3, 4) =================== */}
        {(activeVariant === 1 || activeVariant === 3 || activeVariant === 4) && (
          <div className="absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <div
                key={c.area}
                className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-35 transition-all duration-700"
                style={{
                  left: `${c.x}px`,
                  top: `${c.y}px`,
                  width: '320px',
                  height: '320px',
                  background: `radial-gradient(circle, ${c.color} 0%, ${c.glow} 45%, transparent 70%)`
                }}
              />
            ))}
          </div>
        )}

        {/* =================== CAMADA SVG: CÉLULAS DE VORONOI & LINHAS DE CONEXÃO =================== */}
        <svg
          className="overflow-visible absolute left-0 top-0 pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
          <defs>
            {/* Gradientes para conexões entre duas ciências no Modo 4 */}
            {connections.map((conn) => {
              const srcId = typeof conn.source === 'object' ? (conn.source as any).id : conn.source;
              const tgtId = typeof conn.target === 'object' ? (conn.target as any).id : conn.target;
              const src = visibleNodeMap.get(srcId);
              const tgt = visibleNodeMap.get(tgtId);
              if (!src || !tgt) return null;
              const colorA = SCIENTIFIC_AREAS[src.area as ScientificArea]?.accentColor || '#10B981';
              const colorB = SCIENTIFIC_AREAS[tgt.area as ScientificArea]?.accentColor || '#06B6D4';
              return (
                <linearGradient
                  key={`voronoi-grad-${conn.id}`}
                  id={`voronoi-grad-${conn.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                >
                  <stop offset="0%" stopColor={colorA} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={colorB} stopOpacity="0.85" />
                </linearGradient>
              );
            })}
          </defs>

          {/* ======================= POLÍGONOS DE VORONOI ======================= */}
          {voronoiPolygons.map(({ node, path }) => {
            const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const isNeighbor = neighborIds.has(node.id);

            // ============ CONFIGURAÇÃO POR VARIANTE ============
            let fill = 'none';
            let stroke = 'rgba(148, 163, 184, 0.12)';
            let strokeWidth = 1;
            let strokeDasharray = undefined;
            let filter = undefined;

            if (activeVariant === 1) {
              // V1: Linhas suaves semi-translúcidas com leve cor da área
              stroke = isHovered || isSelected ? areaTheme.accentColor : `${areaTheme.accentColor}35`;
              strokeWidth = isHovered || isSelected ? 1.8 : 0.8;
              fill = isHovered ? `${areaTheme.accentColor}12` : 'none';
            } else if (activeVariant === 2) {
              // V2: Mosaico de Territórios Preenchidos com Vidro
              fill = isHovered
                ? `${areaTheme.accentColor}30`
                : isSelected
                ? `${areaTheme.accentColor}25`
                : `${areaTheme.accentColor}0C`;
              stroke = isHovered ? areaTheme.accentColor : `${areaTheme.accentColor}40`;
              strokeWidth = isHovered ? 2 : 1;
            } else if (activeVariant === 3) {
              // V3: Curvas de nível isométricas contínuas
              stroke = `${areaTheme.accentColor}50`;
              strokeWidth = 1;
              strokeDasharray = '4 4';
              fill = isHovered ? `${areaTheme.accentColor}18` : 'none';
            } else if (activeVariant === 4) {
              // V4: Voronoi Bio-Orgânico suave
              stroke = isHovered ? areaTheme.accentColor : `${areaTheme.accentColor}30`;
              strokeWidth = isHovered ? 2 : 1.2;
              fill = isHovered ? `${areaTheme.accentColor}20` : `${areaTheme.accentColor}08`;
            } else if (activeVariant === 5) {
              // V5: Laser Neon Noturno
              stroke = isHovered
                ? '#FFFFFF'
                : isSelected
                ? areaTheme.accentColor
                : `${areaTheme.accentColor}70`;
              strokeWidth = isHovered ? 2.5 : 1.2;
              fill = isHovered ? `${areaTheme.accentColor}25` : 'none';
            } else if (activeVariant === 6) {
              // V6: Destaque Territorial Conectado (Hover Focus)
              if (isHovered) {
                fill = `${areaTheme.accentColor}40`;
                stroke = '#FFFFFF';
                strokeWidth = 2.5;
              } else if (isNeighbor) {
                fill = `${areaTheme.accentColor}18`;
                stroke = areaTheme.accentColor;
                strokeWidth = 1.8;
              } else {
                fill = 'none';
                stroke = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                strokeWidth = 0.6;
              }
            }

            return (
              <path
                key={`voronoi-${node.id}`}
                d={path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                className="transition-all duration-300"
              />
            );
          })}

          {/* ======================= CURVAS CONCÊNTRICAS TOPOGRÁFICAS (MODO 3) ======================= */}
          {activeVariant === 3 &&
            areaCenters.map((c) => (
              <g key={`topo-${c.area}`}>
                <circle cx={c.x} cy={c.y} r="65" fill="none" stroke={c.color} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx={c.x} cy={c.y} r="120" fill="none" stroke={c.color} strokeOpacity="0.30" strokeWidth="1" />
                <circle cx={c.x} cy={c.y} r="180" fill="none" stroke={c.color} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="6 4" />
              </g>
            ))}

          {/* ======================= LINHAS DE CONEXÃO DO GRAFO ======================= */}
          {connections.map((conn) => {
            const srcId = typeof conn.source === 'object' ? (conn.source as any).id : conn.source;
            const tgtId = typeof conn.target === 'object' ? (conn.target as any).id : conn.target;
            const src = visibleNodeMap.get(srcId);
            const tgt = visibleNodeMap.get(tgtId);

            if (!src || !tgt || src.x === undefined || tgt.x === undefined) return null;

            const isConnectedToSelected =
              selectedNodeId && (src.id === selectedNodeId || tgt.id === selectedNodeId);
            const isConnectedToHovered =
              hoveredNodeId && (src.id === hoveredNodeId || tgt.id === hoveredNodeId);

            let strokeColor =
              theme === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.22)';
            let strokeWidth = 1.2;

            if (activeVariant === 4) {
              // Modo 4: Feixes gradiente vivos entre as duas áreas
              strokeColor = `url(#voronoi-grad-${conn.id})`;
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 3 : 1.8;
            } else if (activeVariant === 5) {
              // Modo 5: Laser neon
              const srcTheme = SCIENTIFIC_AREAS[src.area as ScientificArea];
              strokeColor = isConnectedToSelected || isConnectedToHovered
                ? '#FFFFFF'
                : `${srcTheme.accentColor}80`;
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.4;
            } else if (isConnectedToSelected || isConnectedToHovered) {
              strokeColor = theme === 'dark' ? '#F8FAFC' : '#0F172A';
              strokeWidth = 2.2;
            }

            return (
              <line
                key={`link-${conn.id}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* =================== CAMADA DE ESFERAS E NÓS =================== */}
        {filteredNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isNeighbor = neighborIds.has(node.id);

          return (
            <div
              key={node.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (e.button !== 0) return;
                draggedNodeIdRef.current = node.id;
                didMoveNodeRef.current = false;
                node.fx = node.x;
                node.fy = node.y;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!didMoveNodeRef.current) {
                  setSelectedNodeId(node.id);
                }
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer ${
                isSelected ? 'z-40' : isHovered ? 'z-30' : 'z-20'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Visual do nó: anel topológico + núcleo de cor */}
                <div
                  className={`rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'scale-125'
                      : isHovered
                      ? 'scale-115'
                      : activeVariant === 6 && isNeighbor
                      ? 'scale-105'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    width: '32px',
                    height: '32px',
                    background:
                      activeVariant === 5
                        ? `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${areaTheme.accentColor} 55%, #03060E 100%)`
                        : `radial-gradient(circle at 32% 32%, #FFFFFF 0%, ${areaTheme.accentColor} 50%, #070A10 100%)`,
                    boxShadow: isSelected
                      ? `0 0 20px ${areaTheme.accentColor}`
                      : isHovered
                      ? `0 0 16px ${areaTheme.accentColor}`
                      : `0 2px 8px ${areaTheme.glowColor}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />

                  {/* Anel indicador de seleção */}
                  {isSelected && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-stone-100" />
                  )}
                </div>

                {/* Tooltip do Nó em Hover */}
                {(isHovered || isSelected) && (
                  <div className="absolute top-full mt-2 px-2.5 py-1 rounded-xl bg-stone-900/95 text-white dark:bg-stone-100 dark:text-stone-900 text-[11px] font-medium whitespace-nowrap shadow-xl pointer-events-none z-50 flex items-center gap-1.5 border border-white/10">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: areaTheme.accentColor }}
                    />
                    <span className="font-semibold">{node.title}</span>
                    <span className="text-[9px] font-mono opacity-60">({node.area})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
