import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import * as d3Delaunay from 'd3-delaunay';
import { 
  Compass, 
  Map as MapIcon, 
  Route, 
  Orbit, 
  Crosshair, 
  Radar, 
  GitFork, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export type UXModelId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface ModelInfo {
  id: UXModelId;
  title: string;
  badge: string;
  icon: any;
  desc: string;
}

const UX_MODELS: ModelInfo[] = [
  {
    id: 1,
    title: '1. Voronoi Clássico Puro (Mantido)',
    badge: 'V1 Mantido',
    icon: Compass,
    desc: 'O Voronoi original com células matemáticas suaves e auras de calor temático.'
  },
  {
    id: 2,
    title: '2. Arquipélago de Ilhas Continentais (Atlas do Saber)',
    badge: 'Atlas Geográfico',
    icon: MapIcon,
    desc: '6 grandes territórios/ilhas continentais com fronteiras geográficas delimitadas e pontes marítimas em arco.'
  },
  {
    id: 3,
    title: '3. Trilha Guiada de Descoberta (Constellation Stepper)',
    badge: 'Jornada com Stepper',
    icon: Route,
    desc: 'Uma rota dourada sequencial de 5 passos com controle "Próximo / Anterior" guiando o leitor pelo mapa.'
  },
  {
    id: 4,
    title: '4. Modelo Gravitacional Solar (Órbitas Planetárias)',
    badge: 'Sistema Orbital',
    icon: Orbit,
    desc: 'Um núcleo central de saberes cercado por anéis orbitais concêntricos onde cada ciência ocupa sua órbita planetária.'
  },
  {
    id: 5,
    title: '5. Lente de Microscópio / Inspeção Óptica (Fisheye)',
    badge: 'Lente Reticular',
    icon: Crosshair,
    desc: 'Retículo óptico científico de foco que analisa a esfera sob o cursor e projeta sua assinatura de conexões.'
  },
  {
    id: 6,
    title: '6. Console de Radar Tático & Escaneamento 360°',
    badge: 'Radar de Feixe',
    icon: Radar,
    desc: 'Estética de observatório com varredura circular de feixe de radar e telemetria das frequências científicas.'
  },
  {
    id: 7,
    title: '7. Árvore Filogenética Radial (Dendrograma de Ideias)',
    badge: 'Árvore de Linhagem',
    icon: GitFork,
    desc: 'Estrutura genealógica em anéis que mostra como uma pergunta fundamental se ramifica em galhos de conhecimento.'
  }
];

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);
  const [activeModel, setActiveModel] = useState<UXModelId>(2);

  // Estado para o Stepper da Trilha Guiada (Modelo 3)
  const [journeyStep, setJourneyStep] = useState(0);

  // Ângulo do feixe de radar para o Modelo 6
  const [radarAngle, setRadarAngle] = useState(0);

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

  // Trilha de 5 passos para a variação 3 (Jornada Guiada)
  const journeyNodeIds = ['mat-1', 'bio-2', 'comp-5', 'hum-1', 'fis-1'];

  const getThematicSimilarity = (a: any, b: any): number => {
    let score = 0;
    if (a.area === b.area) score += 0.5;
    if (a.subtopic === b.subtopic) score += 0.25;
    const sharedTags = (a.tags || []).filter((t: string) => (b.tags || []).includes(t)).length;
    score += Math.min(0.25, sharedTags * 0.12);
    return Math.min(1, score);
  };

  // Animação do feixe do radar (Modelo 6)
  useEffect(() => {
    if (activeModel !== 6) return;
    const interval = setInterval(() => {
      setRadarAngle((a) => (a + 2) % 360);
    }, 25);
    return () => clearInterval(interval);
  }, [activeModel]);

  // Força e simulação física
  useEffect(() => {
    const simulationNodes = nodes.map((n, idx) => {
      const existing = simNodesRef.current.find((s) => s.id === n.id);
      const areaTheme = SCIENTIFIC_AREAS[n.area];
      
      // Coordenadas dependendo do modelo ativo
      let initX = existing?.x ?? areaTheme.center.x + (Math.random() - 0.5) * 140;
      let initY = existing?.y ?? areaTheme.center.y + (Math.random() - 0.5) * 140;

      // Posição para o Modelo 4 (Órbitas Planetárias)
      const areaList = Object.keys(SCIENTIFIC_AREAS);
      const areaIndex = areaList.indexOf(n.area);
      const orbitRadius = 140 + areaIndex * 60;
      const angle = (idx * (Math.PI * 2)) / 5;
      const orbitX = Math.cos(angle) * orbitRadius;
      const orbitY = Math.sin(angle) * orbitRadius;

      // Posição para o Modelo 7 (Árvore Radial)
      const treeRadius = 90 + (idx % 4) * 90;
      const treeAngle = ((areaIndex + 0.5) * (Math.PI * 2)) / 6 + ((idx % 3) - 1) * 0.25;
      const treeX = Math.cos(treeAngle) * treeRadius;
      const treeY = Math.sin(treeAngle) * treeRadius;

      return {
        ...n,
        x: activeModel === 4 ? orbitX : activeModel === 7 ? treeX : initX,
        y: activeModel === 4 ? orbitY : activeModel === 7 ? treeY : initY,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        fx: existing?.fx ?? null,
        fy: existing?.fy ?? null,
        targetX: activeModel === 4 ? orbitX : activeModel === 7 ? treeX : areaTheme.center.x,
        targetY: activeModel === 4 ? orbitY : activeModel === 7 ? treeY : areaTheme.center.y
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
      .force('charge', d3.forceManyBody().strength(activeModel === 4 || activeModel === 7 ? -40 : -115))
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
      .force('x', d3.forceX((d: any) => d.targetX).strength(activeModel === 4 || activeModel === 7 ? 0.4 : 0.16))
      .force('y', d3.forceY((d: any) => d.targetY).strength(activeModel === 4 || activeModel === 7 ? 0.4 : 0.16))
      .alphaDecay(0.025);

    simulation.on('tick', () => {
      setTick((t) => (t + 1) % 1000000);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, connections, activeModel]);

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

  // Células de Voronoi (para Modelo 1)
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

  // Ações da Jornada Guiada (Modelo 3)
  const handleJourneyStep = (newStep: number) => {
    const clamped = Math.max(0, Math.min(journeyNodeIds.length - 1, newStep));
    setJourneyStep(clamped);
    const targetId = journeyNodeIds[clamped];
    const targetNode = filteredNodes.find((n) => n.id === targetId);
    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
      setSelectedNodeId(targetId);
      setPan({ x: -targetNode.x, y: -targetNode.y });
      setZoom(1.3);
    }
  };

  const currentJourneyNode = filteredNodes.find((n) => n.id === journeyNodeIds[journeyStep]);
  const hoveredNode = filteredNodes.find((n) => n.id === hoveredNodeId);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-500 ${
        activeModel === 6
          ? 'bg-[#040810] text-cyan-400'
          : activeModel === 4
          ? 'bg-[#060814] text-stone-100'
          : 'bg-stone-100 dark:bg-[#070A10]'
      }`}
      onMouseDown={handleMouseDownMap}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* =========================================================================
          SELETOR DE 7 MODELOS MENTAIS DE GRAFO (DESIGN RADICALMENTE DIFERENTES)
      ========================================================================== */}
      <div className="absolute top-4 left-6 z-40 max-w-4xl pointer-events-auto">
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#0C111C]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                7 Modelos de Navegação Cognitiva
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              {UX_MODELS.find((m) => m.id === activeModel)?.desc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {UX_MODELS.map((model) => {
              const active = activeModel === model.id;
              const IconComp = model.icon;
              return (
                <button
                  key={model.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModel(model.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>M{model.id}</span>
                  <span className="hidden md:inline font-normal opacity-85 text-[10px]">
                    {model.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          HUD CONTROLE DO MODELO 3: STEPPER DE JORNADA GUIADA
      ========================================================================== */}
      {activeModel === 3 && currentJourneyNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/95 dark:bg-[#0E1322]/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                PASSO {journeyStep + 1} DE {journeyNodeIds.length}
              </span>
              <span className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100 max-w-xs truncate">
                {currentJourneyNode.title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={journeyStep === 0}
                onClick={() => handleJourneyStep(journeyStep - 1)}
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-200 disabled:opacity-30 hover:bg-stone-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={journeyStep === journeyNodeIds.length - 1}
                onClick={() => handleJourneyStep(journeyStep + 1)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-mono text-xs font-bold disabled:opacity-30 flex items-center gap-1 hover:bg-amber-400 cursor-pointer"
              >
                <span>Avançar Trilha</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HUD TELEMETRIA DO MODELO 6: RADAR CIBERNÉTICO NO CANTO INFERIOR
      ========================================================================== */}
      {activeModel === 6 && (
        <div className="absolute bottom-6 left-6 z-30 pointer-events-auto flex items-center gap-3 p-3 rounded-2xl bg-black/85 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
          <div className="relative w-16 h-16 rounded-full border border-cyan-500/40 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            <div className="absolute w-full h-px bg-cyan-500/30" />
            <div className="absolute h-full w-px bg-cyan-500/30" />
            {/* Feixe rotativo */}
            <div
              className="absolute top-0 left-0 w-full h-full origin-center pointer-events-none"
              style={{
                transform: `rotate(${radarAngle}deg)`,
                background: 'conic-gradient(from 0deg, rgba(6,182,212,0.4) 0deg, transparent 60deg)'
              }}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="font-mono text-[10px] space-y-0.5">
            <div className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Radar Ativo
            </div>
            <div className="text-stone-400">{filteredNodes.length} sinais detectados</div>
            <div className="text-stone-500 text-[9px]">Varredura: 360° em tempo real</div>
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
        {/* =========================================================================
            MODELO 1: VORONOI CLÁSSICO PURO (MANTIDO CONFORME PEDIDO)
        ========================================================================== */}
        {activeModel === 1 && (
          <>
            <div className="absolute left-0 top-0 pointer-events-none">
              {areaCenters.map((c) => (
                <div
                  key={c.area}
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-35"
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

            <svg className="overflow-visible absolute left-0 top-0 pointer-events-none" style={{ width: 1, height: 1 }}>
              {voronoiPolygons.map(({ node, path }) => {
                const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
                const isHovered = hoveredNodeId === node.id;
                const isSelected = selectedNodeId === node.id;

                return (
                  <path
                    key={`v1-voronoi-${node.id}`}
                    d={path}
                    fill={isHovered ? `${areaTheme.accentColor}18` : 'none'}
                    stroke={isHovered || isSelected ? areaTheme.accentColor : `${areaTheme.accentColor}35`}
                    strokeWidth={isHovered || isSelected ? 1.8 : 0.8}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          </>
        )}

        {/* =========================================================================
            MODELO 2: ARQUIPÉLAGO DE ILHAS CONTINENTAIS (ATLAS DO SABER)
        ========================================================================== */}
        {activeModel === 2 && (
          <div className="absolute left-0 top-0 pointer-events-none">
            {/* Ilhas e placas continentais */}
            {areaCenters.map((c) => (
              <div
                key={`island-${c.area}`}
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
            MODELO 4: ÓRBITAS PLANETÁRIAS DO SISTEMA SOLAR DO CONHECIMENTO
        ========================================================================== */}
        {activeModel === 4 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {/* Sol Central */}
            <circle cx="0" cy="0" r="38" fill="url(#sun-grad)" filter="drop-shadow(0 0 25px rgba(245,158,11,0.6))" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="Newsreader, serif" fontWeight="bold">
              INTERFACE
            </text>

            <defs>
              <radialGradient id="sun-grad">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </radialGradient>
            </defs>

            {/* Anéis orbitais das 6 ciências */}
            {Object.entries(SCIENTIFIC_AREAS).map(([area, cfg], idx) => {
              const r = 140 + idx * 60;
              return (
                <g key={`orbit-${area}`}>
                  <circle cx="0" cy="0" r={r} fill="none" stroke={cfg.accentColor} strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="6 6" />
                  <text x={r} y="-6" fill={cfg.accentColor} fontSize="9" fontFamily="Space Mono, monospace" opacity="0.6">
                    ÓRBITA {area.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* =========================================================================
            MODELO 7: ÁRVORE FILOGENÉTICA RADIAL (DENDROGRAMA)
        ========================================================================== */}
        {activeModel === 7 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            {/* Raiz Central */}
            <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="#6366F1" strokeWidth="2" />
            <text x="0" y="3" textAnchor="middle" fill="#E2E8F0" fontSize="9" fontFamily="Newsreader, serif">
              Raiz
            </text>

            {/* Círculos concêntricos de geração de ideias */}
            {[90, 180, 270, 360].map((r, i) => (
              <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            ))}

            {/* Galhos que saem do centro para as áreas */}
            {Object.entries(SCIENTIFIC_AREAS).map(([area, cfg], idx) => {
              const angle = ((idx + 0.5) * (Math.PI * 2)) / 6;
              const x2 = Math.cos(angle) * 360;
              const y2 = Math.sin(angle) * 360;
              return (
                <line
                  key={`branch-${area}`}
                  x1="0"
                  y1="0"
                  x2={x2}
                  y2={y2}
                  stroke={cfg.accentColor}
                  strokeOpacity="0.3"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        )}

        {/* =========================================================================
            CAMADA SVG DE LINHAS DE CONEXÃO DO GRAFO
        ========================================================================== */}
        <svg className="overflow-visible absolute left-0 top-0 pointer-events-none" style={{ width: 1, height: 1 }}>
          {/* Conexões padrão */}
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

            // No Modelo 2 (Ilhas Continentais), as pontes inter-ilhas viram arcos
            if (activeModel === 2 && src.area !== tgt.area) {
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
              return (
                <path
                  key={`arc-${conn.id}`}
                  d={`M${src.x},${src.y}A${dr},${dr} 0 0,1 ${tgt.x},${tgt.y}`}
                  fill="none"
                  stroke={isConnectedToSelected || isConnectedToHovered ? '#FFFFFF' : 'rgba(99,102,241,0.45)'}
                  strokeWidth={isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.5}
                  strokeDasharray="4 3"
                />
              );
            }

            // No Modelo 7 (Árvore), usamos curvas suaves Bezier
            if (activeModel === 7) {
              return (
                <path
                  key={`tree-link-${conn.id}`}
                  d={`M${src.x},${src.y} Q 0,0 ${tgt.x},${tgt.y}`}
                  fill="none"
                  stroke={isConnectedToSelected || isConnectedToHovered ? '#FFFFFF' : 'rgba(148,163,184,0.25)'}
                  strokeWidth={isConnectedToSelected || isConnectedToHovered ? 2 : 1}
                />
              );
            }

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

          {/* Trilha do Modelo 3 (Linha Dourada Contínua Conectando os 5 Passos da Jornada) */}
          {activeModel === 3 && (
            <g>
              {journeyNodeIds.slice(0, -1).map((srcId, i) => {
                const tgtId = journeyNodeIds[i + 1];
                const src = visibleNodeMap.get(srcId);
                const tgt = visibleNodeMap.get(tgtId);
                if (!src || !tgt) return null;
                const isPassed = i < journeyStep;

                return (
                  <line
                    key={`journey-trail-${i}`}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="#F59E0B"
                    strokeWidth={isPassed ? 3.5 : 2}
                    strokeDasharray={isPassed ? undefined : '5 4'}
                    strokeOpacity={isPassed ? 0.9 : 0.4}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* =========================================================================
            MODELO 5: RETÍCULO / LENTE DE INSPEÇÃO ÓPTICA (FISHEYE)
        ========================================================================== */}
        {activeModel === 5 && hoveredNode && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
            style={{
              left: `${hoveredNode.x}px`,
              top: `${hoveredNode.y}px`
            }}
          >
            {/* Círculo óptico de mira */}
            <div className="w-48 h-48 rounded-full border-2 border-cyan-400/60 bg-cyan-500/5 backdrop-blur-[2px] flex items-center justify-center relative shadow-[0_0_25px_rgba(6,182,212,0.25)]">
              {/* Eixos da mira */}
              <div className="absolute w-full h-px bg-cyan-400/40" />
              <div className="absolute h-full w-px bg-cyan-400/40" />
              <div className="w-20 h-20 rounded-full border border-dashed border-cyan-400/50" />
              
              {/* Etiqueta de Inspeção */}
              <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-400">
                LENS: 2.4x
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CAMADA DE ESFERAS E NÓS DO GRAFO
        ========================================================================== */}
        {filteredNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          // Destaque de nó no Modelo 3 (Passos da Jornada)
          const journeyIndex = journeyNodeIds.indexOf(node.id);
          const isJourneyNode = activeModel === 3 && journeyIndex !== -1;
          const isCurrentJourney = isJourneyNode && journeyIndex === journeyStep;

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
                  if (activeModel === 3 && journeyIndex !== -1) {
                    setJourneyStep(journeyIndex);
                  }
                }
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer ${
                isSelected ? 'z-40' : isHovered ? 'z-30' : isCurrentJourney ? 'z-30' : 'z-20'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Indicador numérico do Modelo 3 */}
                {isJourneyNode && (
                  <div
                    className={`absolute -top-3 -right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shadow-md z-30 transition-transform ${
                      isCurrentJourney
                        ? 'bg-amber-400 text-stone-950 scale-125 animate-bounce'
                        : 'bg-stone-900 border border-amber-500/50 text-amber-400'
                    }`}
                  >
                    {journeyIndex + 1}
                  </div>
                )}

                {/* Esfera 3D do Nó */}
                <div
                  className={`rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'scale-125'
                      : isHovered
                      ? 'scale-115'
                      : isCurrentJourney
                      ? 'scale-125'
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
                      : isCurrentJourney
                      ? '0 0 22px #F59E0B'
                      : `0 2px 8px ${areaTheme.glowColor}`
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />

                  {isSelected && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-stone-100" />
                  )}
                  {isCurrentJourney && !isSelected && (
                    <div className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-pulse" />
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
