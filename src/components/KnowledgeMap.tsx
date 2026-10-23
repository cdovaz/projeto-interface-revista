import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import * as d3Delaunay from 'd3-delaunay';
import { 
  Sparkles, 
  Layers, 
  Compass, 
  Activity, 
  Eye, 
  Zap, 
  HelpCircle, 
  X, 
  MapPin, 
  Radio, 
  BookOpen, 
  ArrowRight,
  MousePointer
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export type UXVariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface VariantInfo {
  id: UXVariantId;
  title: string;
  badge: string;
  desc: string;
}

const UX_VARIANTS: VariantInfo[] = [
  {
    id: 1,
    title: '1. Voronoi Clássico Puro (Mantido)',
    badge: 'V1 Mantido',
    desc: 'Células de Voronoi com bordas finas semi-translúcidas e auras radiais de calor nas 6 ciências.'
  },
  {
    id: 2,
    title: '2. Nomes Topográficos no Fundo (World Labels)',
    badge: 'Marcas d’Água nas Áreas',
    desc: 'Nomes das 6 grandes áreas gravados suavemente no chão do mapa com tipografia serifada editorial.'
  },
  {
    id: 3,
    title: '3. Cartão de Boas-Vindas "Decodificador do Mapa"',
    badge: 'Onboarding Compacto',
    desc: 'Pílula flutuante descartável no canto explicando: Esfera = Texto, Cores = Áreas, Linhas = Conexões.'
  },
  {
    id: 4,
    title: '4. Barra Inferior de Áreas com Iluminação Ativa',
    badge: 'Fita de Áreas Interativa',
    desc: 'Dock com as 6 ciências no rodapé; ao passar o mouse numa área, apenas seu território e nós acendem.'
  },
  {
    id: 5,
    title: '5. Nó em Destaque Inicial (Hero Pulse & Card Aberto)',
    badge: 'Ponto Focal de Entrada',
    desc: 'Um artigo central importante carrega com halo pulsante suave e mini-card editorial convidando à leitura.'
  },
  {
    id: 6,
    title: '6. Linhas com Rótulos Semânticos em Tempo Real',
    badge: 'Rótulo das Linhas no Hover',
    desc: 'Ao passar o mouse sobre um nó, as pontes revelam a relação intelectual ("explica", "aplica método", "contradiz").'
  },
  {
    id: 7,
    title: '7. Suíte Completa de UX Cognitiva (Fusão 2+3+4+5+6)',
    badge: 'Experiência Completa',
    desc: 'Combina rótulos das áreas no fundo + decodificador de entrada + fita interativa + conexões semânticas.'
  }
];

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);
  const [activeVariant, setActiveVariant] = useState<UXVariantId>(7);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [highlightedArea, setHighlightedArea] = useState<ScientificArea | null>(null);

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

  // Células de Voronoi (base mantida de V1)
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

  const areaCenters = Object.entries(SCIENTIFIC_AREAS).map(([area, config]) => ({
    area: area as ScientificArea,
    label: config.label,
    x: config.center.x,
    y: config.center.y,
    color: config.accentColor,
    glow: config.glowColor
  }));

  // Hero node para as variações 5 e 7
  const heroNode = filteredNodes.find((n) => n.id === 'comp-5') || filteredNodes[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-stone-100 dark:bg-[#070A10]"
      onMouseDown={handleMouseDownMap}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* =========================================================================
          SELETOR DE 7 VARIAÇÕES DE UX DO GRAFO
      ========================================================================== */}
      <div className="absolute top-4 left-6 z-40 max-w-4xl pointer-events-auto">
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#0C111C]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Compass className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                7 Variações de UX do Grafo (Navegar)
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              {UX_VARIANTS.find((v) => v.id === activeVariant)?.desc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {UX_VARIANTS.map((v) => {
              const active = activeVariant === v.id;
              return (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVariant(v.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5'
                  }`}
                >
                  <span>V{v.id}</span>
                  <span className="hidden md:inline font-normal opacity-85 text-[10px]">
                    {v.badge.split('+')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          VARIAÇÕES 3 & 7: CARTÃO FLUTUANTE DECODIFICADOR DO MAPA (ONBOARDING)
      ========================================================================== */}
      {(activeVariant === 3 || activeVariant === 7) && showWelcomeCard && (
        <div className="absolute top-24 left-6 z-30 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative p-4 rounded-2xl bg-white/95 dark:bg-[#0E1422]/95 backdrop-blur-xl border border-indigo-500/30 shadow-2xl space-y-3">
            <button
              onClick={() => setShowWelcomeCard(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-200 p-1 rounded-lg"
              title="Fechar dica"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100">
                Como ler este mapa vivo?
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shrink-0 mt-0.5 shadow-sm" />
                <span>
                  <strong>Cada esfera</strong> é uma publicação de um pesquisador.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-md bg-stone-800 border border-white/20 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[9px] text-amber-400">
                  🎨
                </span>
                <span>
                  <strong>As 6 cores</strong> representam as áreas do conhecimento (Biologia, Computação, Física, Matemática, Química, Humanidades).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-0.5 bg-white/40 shrink-0 mt-2" />
                <span>
                  <strong>As linhas</strong> mostram pontes intelectuais reais entre os artigos (ex: aplicação, contradição ou derivação).
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1 text-indigo-400">
                <MousePointer className="w-3 h-3" /> Clique na esfera para ler
              </span>
              <span>Arraste para mover</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VARIAÇÕES 4 & 7: DOCK INFERIOR DE ÁREAS COM ILUMINAÇÃO INTERATIVA
      ========================================================================== */}
      {(activeVariant === 4 || activeVariant === 7) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
            <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-stone-400 hidden sm:inline">
              Áreas:
            </span>
            {areaCenters.map((item) => {
              const isHovered = highlightedArea === item.area;
              return (
                <button
                  key={item.area}
                  onMouseEnter={() => setHighlightedArea(item.area)}
                  onMouseLeave={() => setHighlightedArea(null)}
                  onClick={() => {
                    const theme = SCIENTIFIC_AREAS[item.area];
                    setPan({ x: -theme.center.x, y: -theme.center.y });
                    setZoom(1.2);
                  }}
                  className="px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  style={{
                    backgroundColor: isHovered ? `${item.color}30` : 'transparent',
                    border: `1px solid ${isHovered ? item.color : `${item.color}35`}`,
                    color: item.color,
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)'
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.glow}` }}
                  />
                  <span>{item.area}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        {/* =================== VARIAÇÃO 1 (BASE MANTIDA): AURAS RADIAIS TOPOLÓGICAS =================== */}
        <div className="absolute left-0 top-0 pointer-events-none">
          {areaCenters.map((c) => {
            const isAreaHighlighted = highlightedArea === c.area;
            return (
              <div
                key={c.area}
                className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl transition-all duration-700 pointer-events-none"
                style={{
                  left: `${c.x}px`,
                  top: `${c.y}px`,
                  width: '320px',
                  height: '320px',
                  opacity: isAreaHighlighted ? 0.75 : 0.35,
                  background: `radial-gradient(circle, ${c.color} 0%, ${c.glow} 45%, transparent 70%)`
                }}
              />
            );
          })}
        </div>

        {/* =================== VARIAÇÕES 2 & 7: NOMES DAS ÁREAS EM SEGUNDO PLANO (WORLD LABELS) =================== */}
        {(activeVariant === 2 || activeVariant === 7) && (
          <div className="absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <div
                key={`label-${c.area}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none transition-all duration-500"
                style={{
                  left: `${c.x}px`,
                  top: `${c.y}px`
                }}
              >
                <span
                  className="font-editorial text-4xl sm:text-5xl font-bold tracking-widest uppercase select-none opacity-20 dark:opacity-15"
                  style={{ color: c.color }}
                >
                  {c.area}
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 text-stone-500 mt-1">
                  Território do Conhecimento
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =================== CAMADA SVG: POLÍGONOS DE VORONOI & LINHAS DE CONEXÃO =================== */}
        <svg
          className="overflow-visible absolute left-0 top-0 pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
          {/* Células de Voronoi (Base V1 Mantida) */}
          {voronoiPolygons.map(({ node, path }) => {
            const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const isAreaHighlighted = highlightedArea === node.area;

            let stroke = isHovered || isSelected 
              ? areaTheme.accentColor 
              : isAreaHighlighted 
              ? `${areaTheme.accentColor}80`
              : `${areaTheme.accentColor}35`;
            let strokeWidth = isHovered || isSelected ? 1.8 : isAreaHighlighted ? 1.4 : 0.8;
            let fill = isHovered 
              ? `${areaTheme.accentColor}18` 
              : isAreaHighlighted 
              ? `${areaTheme.accentColor}0C`
              : 'none';

            return (
              <path
                key={`voronoi-${node.id}`}
                d={path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Linhas de Conexão */}
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

            const strokeColor =
              isConnectedToSelected || isConnectedToHovered
                ? theme === 'dark'
                  ? '#F8FAFC'
                  : '#0F172A'
                : theme === 'dark'
                ? 'rgba(255, 255, 255, 0.22)'
                : 'rgba(15, 23, 42, 0.22)';

            const strokeWidth =
              isConnectedToSelected || isConnectedToHovered ? 2.2 : 1.2;

            return (
              <g key={`link-${conn.id}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />

                {/* =================== VARIAÇÕES 6 & 7: RÓTULOS SEMÂNTICOS NO HOVER =================== */}
                {(activeVariant === 6 || activeVariant === 7) &&
                  (isConnectedToHovered || isConnectedToSelected) && (
                    <g>
                      <rect
                        x={(src.x + tgt.x) / 2 - 45}
                        y={(src.y + tgt.y) / 2 - 12}
                        width="90"
                        height="18"
                        rx="9"
                        fill={theme === 'dark' ? '#0E1422' : '#FFFFFF'}
                        stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                        strokeWidth="1"
                      />
                      <text
                        x={(src.x + tgt.x) / 2}
                        y={(src.y + tgt.y) / 2}
                        dominantBaseline="central"
                        textAnchor="middle"
                        fill={theme === 'dark' ? '#94A3B8' : '#475569'}
                        fontSize="9"
                        fontFamily="Space Mono, monospace"
                        fontWeight="bold"
                      >
                        {conn.type}
                      </text>
                    </g>
                  )}
              </g>
            );
          })}
        </svg>

        {/* =================== CAMADA DE ESFERAS E NÓS =================== */}
        {filteredNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isHero = (activeVariant === 5 || activeVariant === 7) && heroNode?.id === node.id;
          const isAreaHighlighted = highlightedArea === node.area;

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
                isSelected ? 'z-40' : isHovered ? 'z-30' : isHero ? 'z-30' : 'z-20'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* =================== VARIAÇÕES 5 & 7: HERO PULSE DE ENTRADA =================== */}
                {isHero && !isSelected && !isHovered && (
                  <div
                    className="absolute -inset-3 rounded-full animate-ping opacity-35 pointer-events-none"
                    style={{ backgroundColor: areaTheme.accentColor }}
                  />
                )}

                {/* Esfera 3D do Nó */}
                <div
                  className={`rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'scale-125'
                      : isHovered
                      ? 'scale-115'
                      : isAreaHighlighted
                      ? 'scale-110'
                      : isHero
                      ? 'scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: `radial-gradient(circle at 32% 32%, #FFFFFF 0%, ${areaTheme.accentColor} 50%, #070A10 100%)`,
                    boxShadow: isSelected
                      ? `0 0 20px ${areaTheme.accentColor}`
                      : isHovered
                      ? `0 0 16px ${areaTheme.accentColor}`
                      : isHero
                      ? `0 0 18px ${areaTheme.accentColor}`
                      : `0 2px 8px ${areaTheme.glowColor}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />

                  {isSelected && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-stone-100" />
                  )}
                </div>

                {/* =================== VARIAÇÕES 5 & 7: MINI-CARD ABERTO DO NÓ HERO =================== */}
                {isHero && !isHovered && !selectedNodeId && (
                  <div className="absolute top-full mt-2.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0E1422]/95 border border-indigo-500/40 shadow-xl pointer-events-none flex flex-col items-center gap-0.5 whitespace-nowrap z-40 animate-bounce">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Clique para explorar
                    </span>
                    <span className="font-editorial text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {node.title}
                    </span>
                  </div>
                )}

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
