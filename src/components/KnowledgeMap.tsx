import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import { 
  Compass, 
  Anchor, 
  Layers, 
  Train, 
  Building2, 
  Sparkles, 
  Cpu, 
  Mountain, 
  Grid, 
  MapPin
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export type ExplorationVariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface VariantMeta {
  id: ExplorationVariantId;
  title: string;
  badge: string;
  icon: any;
  desc: string;
}

const EXPLORATION_VARIANTS: VariantMeta[] = [
  {
    id: 1,
    title: '1. M2 Original Mantido (Arquipélago de Ilhas)',
    badge: 'M2 Mantido',
    icon: Compass,
    desc: 'O M2 original com 6 territórios insulares delimitados, contornos geográficos e pontes marítimas em arco.'
  },
  {
    id: 2,
    title: '2. Carta Náutica & Portolano (Age of Discovery)',
    badge: 'Carta Náutica',
    icon: Anchor,
    desc: 'Estética de mapa de navegação com linhas de rumo cruzando o oceano, rosa dos ventos e rotas marítimas tracejadas.'
  },
  {
    id: 3,
    title: '3. Tectônica de Placas & Fendas Geológicas',
    badge: 'Placas Tectônicas',
    icon: Layers,
    desc: 'As ciências como placas litosféricas poligonais que se encontram em fendas e falhas luminosas de atrito interdisciplinar.'
  },
  {
    id: 4,
    title: '4. Mapa Metroviário / Linhas de Trânsito (Transit Map)',
    badge: 'Metrô Vignelli',
    icon: Train,
    desc: 'Estilo de mapa de metrô: linhas coloridas a 45°/90°, publicações como estações e pontes como estações de baldeação.'
  },
  {
    id: 5,
    title: '5. Cidadela do Saber (Distritos Urbanos Isométricos)',
    badge: 'Cidade do Saber',
    icon: Building2,
    desc: 'Planta de metrópole intelectual com distritos temáticos em quarteirões, praças centrais e grandes avenidas viárias.'
  },
  {
    id: 6,
    title: '6. Carta Celeste & Planisfério de Constelações',
    badge: 'Atlas Estelar',
    icon: Sparkles,
    desc: 'Atlas astronômico com polígonos zodiacais das ciências, estrelas de magnitudes variadas e anéis de ascensão reta.'
  },
  {
    id: 7,
    title: '7. Placa-Mãe & Circuito Bio-Silício (Motherboard)',
    badge: 'Circuito Integrado',
    icon: Cpu,
    desc: 'Estrutura de microeletrônica com barramentos ortogonais dourados, processadores centrais por área e pinos de solda.'
  },
  {
    id: 8,
    title: '8. Relevo em Terraços / Curvas de Nível em Degraus',
    badge: 'Relevo em Degraus',
    icon: Mountain,
    desc: 'Platôs topográficos em degraus concêntricos onde o topo de cada montanha abriga os textos de maior impacto.'
  },
  {
    id: 9,
    title: '9. Malha Gravitacional de Espaço-Tempo (Warped Grid)',
    badge: 'Malha Espaço-Tempo',
    icon: Grid,
    desc: 'Grade de espaço-tempo deformada que afunda gravitacionalmente nos centros de cada disciplina com linhas geodésicas.'
  }
];

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);
  const [activeVariant, setActiveVariant] = useState<ExplorationVariantId>(1);

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

  const areaCenters = Object.entries(SCIENTIFIC_AREAS).map(([area, config]) => ({
    area: area as ScientificArea,
    label: config.label,
    x: config.center.x,
    y: config.center.y,
    color: config.accentColor,
    glow: config.glowColor
  }));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-500 ${
        activeVariant === 2
          ? 'bg-[#0A0D14] text-[#E2D9C8]'
          : activeVariant === 7
          ? 'bg-[#040810] text-emerald-400'
          : activeVariant === 9
          ? 'bg-[#03050C] text-indigo-200'
          : 'bg-stone-100 dark:bg-[#070A10]'
      }`}
      onMouseDown={handleMouseDownMap}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* =========================================================================
          SELETOR DE 9 VARIAÇÕES DE NAVEGAÇÃO ESPACIAL DO GRAFO
      ========================================================================== */}
      <div className="absolute top-4 left-6 z-40 max-w-5xl pointer-events-auto">
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#0C111C]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                M2 Mantido + 8 Novas Formas de Grafo
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              {EXPLORATION_VARIANTS.find((v) => v.id === activeVariant)?.desc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {EXPLORATION_VARIANTS.map((v) => {
              const active = activeVariant === v.id;
              const IconComp = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVariant(v.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>V{v.id}</span>
                  <span className="hidden md:inline font-normal opacity-85 text-[10px]">
                    {v.badge}
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
        {/* =========================================================================
            VARIAÇÃO 1 (M2 ORIGINAL MANTIDO): ARQUIPÉLAGO DE ILHAS CONTINENTAIS
        ========================================================================== */}
        {activeVariant === 1 && (
          <div className="absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <div
                key={`v1-island-${c.area}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center transition-all duration-500"
                style={{
                  left: `${c.x}px`,
                  top: `${c.y}px`,
                  width: '340px',
                  height: '280px',
                  borderRadius: '120px 180px 140px 160px',
                  background: `radial-gradient(ellipse at 50% 50%, ${c.color}15 0%, ${c.color}08 60%, transparent 80%)`,
                  border: `2px dashed ${c.color}40`,
                  boxShadow: `0 0 40px ${c.glow}15`
                }}
              >
                <div className="text-center select-none pt-2 opacity-50">
                  <span className="font-editorial text-2xl font-bold uppercase tracking-widest block" style={{ color: c.color }}>
                    {c.area}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">
                    Território Científico
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            VARIAÇÃO 2: CARTA NÁUTICA & PORTOLANO (LINHAS DE RUMO & ROSA DOS VENTOS)
        ========================================================================== */}
        {activeVariant === 2 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {/* Rosa dos Ventos Central */}
            <circle cx="0" cy="0" r="140" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="280" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
            {/* Linhas de rumo / rhumb lines */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x2 = Math.cos(rad) * 600;
              const y2 = Math.sin(rad) * 600;
              return (
                <line
                  key={`rhumb-${deg}`}
                  x1={-x2}
                  y1={-y2}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(212,175,55,0.12)"
                  strokeWidth="0.8"
                />
              );
            })}
            <text x="0" y="5" textAnchor="middle" fill="#D4AF37" fontSize="11" fontFamily="Newsreader, serif" letterSpacing="0.2em">
              TERRA INCOGNITA
            </text>
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 3: TECTÔNICA DE PLACAS & FENDAS GEOLÓGICAS (MAGMA NEON)
        ========================================================================== */}
        {activeVariant === 3 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <polygon
                key={`plate-${c.area}`}
                points={`${c.x - 140},${c.y - 110} ${c.x + 130},${c.y - 120} ${c.x + 150},${c.y + 110} ${c.x - 130},${c.y + 130}`}
                fill={`${c.color}0D`}
                stroke={c.color}
                strokeWidth="2.5"
                strokeDasharray="8 4"
                filter={`drop-shadow(0 0 12px ${c.glow}40)`}
              />
            ))}
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 4: MAPA METROVIÁRIO / LINHAS DE TRÂNSITO (TRANSIT MAP A 45°/90°)
        ========================================================================== */}
        {activeVariant === 4 && (
          <div className="absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <div
                key={`station-box-${c.area}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-md border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  left: `${c.x}px`,
                  top: `${c.y - 110}px`,
                  borderColor: c.color,
                  backgroundColor: `${c.color}20`,
                  color: c.color
                }}
              >
                <Train className="w-3 h-3" />
                <span>Linha {c.area}</span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            VARIAÇÃO 5: CIDADELA DO SABER (DISTRITOS URBANOS ISOMÉTRICOS)
        ========================================================================== */}
        {activeVariant === 5 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <g key={`city-block-${c.area}`}>
                {/* Quarteirão Urbano */}
                <rect
                  x={c.x - 140}
                  y={c.y - 110}
                  width="280"
                  height="220"
                  rx="16"
                  fill="none"
                  stroke={c.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
                <rect
                  x={c.x - 120}
                  y={c.y - 90}
                  width="240"
                  height="180"
                  rx="8"
                  fill={`${c.color}08`}
                  stroke={c.color}
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  strokeOpacity="0.25"
                />
                <text
                  x={c.x}
                  y={c.y - 118}
                  textAnchor="middle"
                  fill={c.color}
                  fontSize="11"
                  fontFamily="Space Mono, monospace"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                >
                  DISTRITO DE {c.area.toUpperCase()}
                </text>
              </g>
            ))}
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 6: CARTA CELESTE PLANISFÉRIO (CONSTELAÇÕES ZODIACAIS)
        ========================================================================== */}
        {activeVariant === 6 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            <circle cx="0" cy="0" r="320" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="480" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {areaCenters.map((c, idx) => {
              const r = 240 + (idx % 2) * 50;
              return (
                <circle
                  key={`star-ring-${c.area}`}
                  cx={c.x}
                  cy={c.y}
                  r="120"
                  fill="none"
                  stroke={c.color}
                  strokeOpacity="0.2"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                />
              );
            })}
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 7: PLACA-MÃE & CIRCUITO BIO-SILÍCIO (TRILHAS DE COBRE)
        ========================================================================== */}
        {activeVariant === 7 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {/* Grade de trilhas de circuito de fundo */}
            <pattern id="pcb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="1" />
            </pattern>
            <rect x="-800" y="-600" width="1600" height="1200" fill="url(#pcb-grid)" />

            {/* Chips Centrais das Áreas */}
            {areaCenters.map((c) => (
              <g key={`chip-${c.area}`}>
                <rect
                  x={c.x - 70}
                  y={c.y - 70}
                  width="140"
                  height="140"
                  rx="6"
                  fill="#0B131E"
                  stroke={c.color}
                  strokeWidth="2"
                  filter={`drop-shadow(0 0 10px ${c.color}40)`}
                />
                <circle cx={c.x} cy={c.y} r="6" fill={c.color} />
                <text x={c.x} y={c.y + 24} textAnchor="middle" fill={c.color} fontSize="9" fontFamily="Space Mono, monospace" fontWeight="bold">
                  {c.area.toUpperCase()}
                </text>
              </g>
            ))}
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 8: RELEVO EM TERRAÇOS / CURVAS DE NÍVEL EM DEGRAUS
        ========================================================================== */}
        {activeVariant === 8 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {areaCenters.map((c) => (
              <g key={`steppe-${c.area}`}>
                {/* 3 degraus concêntricos de elevação */}
                <ellipse cx={c.x} cy={c.y} rx="160" ry="120" fill={`${c.color}08`} stroke={c.color} strokeWidth="1" strokeOpacity="0.25" />
                <ellipse cx={c.x} cy={c.y} rx="110" ry="85" fill={`${c.color}10`} stroke={c.color} strokeWidth="1.2" strokeOpacity="0.4" />
                <ellipse cx={c.x} cy={c.y} rx="60" ry="45" fill={`${c.color}18`} stroke={c.color} strokeWidth="1.5" strokeOpacity="0.6" />
                <text x={c.x} y={c.y - 128} textAnchor="middle" fill={c.color} fontSize="10" fontFamily="Newsreader, serif" fontWeight="bold">
                  Pico de {c.area}
                </text>
              </g>
            ))}
          </svg>
        )}

        {/* =========================================================================
            VARIAÇÃO 9: MALHA GRAVITACIONAL DE ESPAÇO-TEMPO (WARPED GRID)
        ========================================================================== */}
        {activeVariant === 9 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {/* Grade deformada */}
            {[-300, -200, -100, 0, 100, 200, 300].map((step) => (
              <g key={`warp-${step}`}>
                <line x1="-600" y1={step} x2="600" y2={step} stroke="rgba(99,102,241,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={step} y1="-500" x2={step} y2="500" stroke="rgba(99,102,241,0.18)" strokeWidth="1" strokeDasharray="3 3" />
              </g>
            ))}
            {areaCenters.map((c) => (
              <circle
                key={`gravity-well-${c.area}`}
                cx={c.x}
                cy={c.y}
                r="110"
                fill="none"
                stroke={c.color}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                strokeOpacity="0.35"
              />
            ))}
          </svg>
        )}

        {/* =========================================================================
            CAMADA SVG DE LINHAS DE CONEXÃO DO GRAFO (ADAPTATIVA POR MODELO)
        ========================================================================== */}
        <svg className="overflow-visible absolute left-0 top-0 pointer-events-none" style={{ width: 1, height: 1 }}>
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

            // ============ COMPORTAMENTO DA CONEXÃO POR MODELO ============
            
            // Modelo 1 (M2 Mantido): Arcos pontilhados inter-ilhas
            if (activeVariant === 1 && src.area !== tgt.area) {
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
              return (
                <path
                  key={`v1-arc-${conn.id}`}
                  d={`M${src.x},${src.y}A${dr},${dr} 0 0,1 ${tgt.x},${tgt.y}`}
                  fill="none"
                  stroke={isConnectedToSelected || isConnectedToHovered ? '#FFFFFF' : 'rgba(99,102,241,0.45)'}
                  strokeWidth={isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.5}
                  strokeDasharray="4 3"
                />
              );
            }

            // Modelo 4 (Metrô): Linhas ortogonais e a 45 graus
            if (activeVariant === 4) {
              const midX = (src.x + tgt.x) / 2;
              return (
                <path
                  key={`metro-${conn.id}`}
                  d={`M${src.x},${src.y} L${midX},${src.y} L${tgt.x},${tgt.y}`}
                  fill="none"
                  stroke={isConnectedToSelected || isConnectedToHovered ? '#FFFFFF' : `${SCIENTIFIC_AREAS[src.area as ScientificArea]?.accentColor}80`}
                  strokeWidth={isConnectedToSelected || isConnectedToHovered ? 3.5 : 2.5}
                  strokeLinecap="round"
                />
              );
            }

            // Modelo 7 (Motherboard): Trilhas ortogonais a 90 graus exatos
            if (activeVariant === 7) {
              return (
                <path
                  key={`pcb-trace-${conn.id}`}
                  d={`M${src.x},${src.y} H${tgt.x} V${tgt.y}`}
                  fill="none"
                  stroke={isConnectedToSelected || isConnectedToHovered ? '#10B981' : 'rgba(16,185,129,0.35)'}
                  strokeWidth={isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.5}
                />
              );
            }

            // Padrão linear para os demais modelos
            const strokeColor =
              isConnectedToSelected || isConnectedToHovered
                ? theme === 'dark'
                  ? '#F8FAFC'
                  : '#0F172A'
                : theme === 'dark'
                ? 'rgba(255, 255, 255, 0.22)'
                : 'rgba(15, 23, 42, 0.22)';

            return (
              <line
                key={`line-${conn.id}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={strokeColor}
                strokeWidth={isConnectedToSelected || isConnectedToHovered ? 2.2 : 1.2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* =========================================================================
            CAMADA DE ESFERAS E NÓS DO GRAFO
        ========================================================================== */}
        {filteredNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

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
                {/* Visual do Nó específico para Modelo 4 (Estação de Metrô) */}
                {activeVariant === 4 ? (
                  <div
                    className={`w-7 h-7 rounded-full bg-white border-4 transition-transform flex items-center justify-center ${
                      isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                    }`}
                    style={{
                      borderColor: areaTheme.accentColor,
                      boxShadow: `0 0 10px ${areaTheme.glowColor}`
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: areaTheme.accentColor }} />
                  </div>
                ) : activeVariant === 7 ? (
                  // Modelo 7: Microchip de Circuito
                  <div
                    className={`w-6 h-6 rounded-sm border bg-stone-950 flex items-center justify-center transition-transform ${
                      isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                    }`}
                    style={{
                      borderColor: areaTheme.accentColor,
                      boxShadow: `0 0 8px ${areaTheme.accentColor}`
                    }}
                  >
                    <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: areaTheme.accentColor }} />
                  </div>
                ) : (
                  // Esfera 3D Padrão
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                    }`}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: `radial-gradient(circle at 32% 32%, #FFFFFF 0%, ${areaTheme.accentColor} 50%, #070A10 100%)`,
                      boxShadow: isSelected
                        ? `0 0 20px ${areaTheme.accentColor}`
                        : isHovered
                        ? `0 0 16px ${areaTheme.accentColor}`
                        : `0 2px 8px ${areaTheme.glowColor}`
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />

                    {isSelected && (
                      <div className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-stone-100" />
                    )}
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
