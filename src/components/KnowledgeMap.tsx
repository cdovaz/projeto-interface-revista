import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import { Sparkles, Eye, Maximize2, Zap } from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export type GraphVisualMode = 1 | 2 | 3 | 4 | 5 | 6;

interface ModeConfig {
  id: GraphVisualMode;
  title: string;
  badge: string;
  desc: string;
}

const GRAPH_MODES: ModeConfig[] = [
  {
    id: 1,
    title: '1. Orbes Prismáticos (Padrão Atual)',
    badge: 'Esferas 3D + Linhas Neutras',
    desc: 'Esferas com gradiente tridimensional e linhas dinâmicas adaptativas.'
  },
  {
    id: 2,
    title: '2. Constelação Cósmica & Vias Neurais',
    badge: 'Feixes Gradiente + Pulso de Partículas',
    desc: 'Linhas com gradiente multicolorido entre as duas áreas conectadas e anéis de brilho estelar nas esferas.'
  },
  {
    id: 3,
    title: '3. Cartografia Topológica & Campos de Força',
    badge: 'Campos de Voronoi/Auras + Ilhas de Conhecimento',
    desc: 'Nuvens/auras luminosas contínuas ao redor de cada área científica com relevo de proximidade temática.'
  },
  {
    id: 4,
    title: '4. Grafo Editorial Tipográfico (Revista Viva)',
    badge: 'Títulos Visíveis Flutuantes + Tipografia Serif',
    desc: 'Rótulos dos artigos sempre visíveis em fonte editorial Newsreader com pill tags nas conexões ativas.'
  },
  {
    id: 5,
    title: '5. Matriz Sináptica Cibernética (Circuit / HUD)',
    badge: 'Vias de Circuito + Nós Tecnológicos com Anéis',
    desc: 'Estilo blueprint tecnológico com linhas angulares em circuito, coordenadas polares e aneis concêntricos nos nós.'
  },
  {
    id: 6,
    title: '6. Escultura Gravitacional (Clusters por Volume)',
    badge: 'Nós Proporcionais a Visitas + Órbitas Relativas',
    desc: 'O tamanho da esfera varia conforme o impacto/visitas do texto e as pontes possuem espessura proporcional ao fluxo.'
  }
];

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);
  const [visualMode, setVisualMode] = useState<GraphVisualMode>(1);

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

  // Arrastar uma esfera individualmente
  const draggedNodeIdRef = useRef<string | null>(null);
  const didMoveNodeRef = useRef(false);

  const simNodesRef = useRef<any[]>([]);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  // Calcula similaridade temática entre dois nós (0 a 1)
  const getThematicSimilarity = (a: any, b: any): number => {
    let score = 0;
    if (a.area === b.area) score += 0.5;
    if (a.subtopic === b.subtopic) score += 0.25;
    const sharedTags = (a.tags || []).filter((t: string) => (b.tags || []).includes(t)).length;
    score += Math.min(0.25, sharedTags * 0.12);
    return Math.min(1, score);
  };

  // Inicializa e mantém a física com proximidade temática e conexões móveis
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

    // 1. Links explícitos das conexões com distância proporcional à proximidade temática
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

    // 2. Força customizada de afinidade temática entre todos os pares
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
      .force('charge', d3.forceManyBody().strength(-110))
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

  const getSphereGradient = (areaName: ScientificArea) => {
    switch (areaName) {
      case 'Biologia':
        return 'from-emerald-400 to-teal-600';
      case 'Química':
        return 'from-amber-400 to-orange-500';
      case 'Física':
        return 'from-indigo-400 to-blue-700';
      case 'Matemática':
        return 'from-violet-400 to-purple-700';
      case 'Computação':
        return 'from-cyan-400 to-blue-600';
      case 'Humanidades':
        return 'from-pink-400 to-rose-600';
      default:
        return 'from-stone-400 to-stone-600';
    }
  };

  // Helper para tamanho de nó no modo 6 (gravitacional proporcional)
  const getNodeSize = (node: any) => {
    if (visualMode === 6) {
      // 1000 a 4000 views -> 24px a 44px
      const base = 26;
      const views = node.views || 1000;
      const extra = Math.min(18, Math.max(0, (views - 800) / 180));
      return base + extra;
    }
    return 32; // padrão 32px
  };

  // Centros das 6 áreas para desenhar campos/auras no Modo 3
  const areaCenters = Object.entries(SCIENTIFIC_AREAS).map(([area, config]) => ({
    area: area as ScientificArea,
    x: config.center.x,
    y: config.center.y,
    color: config.accentColor,
    glow: config.glowColor
  }));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-500 ${
        visualMode === 5
          ? 'bg-[#030712] text-cyan-400'
          : visualMode === 2
          ? 'bg-[#05060E] text-stone-100'
          : 'bg-stone-100 dark:bg-[#070A10]'
      }`}
      onMouseDown={handleMouseDownMap}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* =========================================================================
          SELETOR FLUTUANTE DE 6 VARIAÇÕES DA TELA NAVEGAR
      ========================================================================== */}
      <div className="absolute top-4 left-6 z-40 max-w-4xl pointer-events-auto">
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-white/90 dark:bg-[#0C111C]/90 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                6 Variações do Grafo Interativo
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              {GRAPH_MODES.find((m) => m.id === visualMode)?.desc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {GRAPH_MODES.map((mode) => {
              const active = visualMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisualMode(mode.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-stone-100 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5'
                  }`}
                >
                  <span>V{mode.id}</span>
                  <span className="hidden md:inline font-normal opacity-85 text-[10px]">
                    {mode.badge.split('+')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid cibernético de fundo no Modo 5 */}
      {visualMode === 5 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      )}

      {/* Efeito estelar cósmico no Modo 2 */}
      {visualMode === 2 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 45%, transparent 75%)'
          }}
        />
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
        {/* =================== MODO 3: AURAS DE RELEVO TOPOLÓGICO =================== */}
        {visualMode === 3 && (
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

        {/* =================== MODO 5: CÍRCULOS DE RADAR / COORDENADAS POLARES =================== */}
        {visualMode === 5 && (
          <svg className="overflow-visible absolute left-0 top-0 pointer-events-none">
            <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="320" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
            <circle cx="0" cy="0" r="480" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" strokeDasharray="8 8" />
            <line x1="-500" y1="0" x2="500" y2="0" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
            <line x1="0" y1="-500" x2="0" y2="500" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
          </svg>
        )}

        {/* =================== 1. CAMADA SVG DE LINHAS E CONEXÕES =================== */}
        <svg
          className="overflow-visible absolute left-0 top-0 pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
          <defs>
            {/* Definições de gradientes para as conexões do Modo 2 */}
            {connections.map((conn) => {
              const srcId = typeof conn.source === 'object' ? (conn.source as any).id : conn.source;
              const tgtId = typeof conn.target === 'object' ? (conn.target as any).id : conn.target;
              const src = visibleNodeMap.get(srcId);
              const tgt = visibleNodeMap.get(tgtId);
              if (!src || !tgt) return null;
              const colorA = SCIENTIFIC_AREAS[src.area as ScientificArea]?.accentColor || '#6366F1';
              const colorB = SCIENTIFIC_AREAS[tgt.area as ScientificArea]?.accentColor || '#06B6D4';
              return (
                <linearGradient
                  key={`grad-${conn.id}`}
                  id={`grad-${conn.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                >
                  <stop offset="0%" stopColor={colorA} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={colorB} stopOpacity="0.8" />
                </linearGradient>
              );
            })}
          </defs>

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
            const isInTrail =
              focusMode && explorationTrail.includes(src.id) && explorationTrail.includes(tgt.id);

            // ============ CONFIGURAÇÃO POR VARIAÇÃO VISUAL ============
            let strokeColor =
              theme === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.22)';
            let strokeWidth = 1.2;
            let strokeDasharray = undefined;

            if (visualMode === 2) {
              // Modo 2: Constelação com gradiente entre as duas áreas e feixe iluminado
              strokeColor = `url(#grad-${conn.id})`;
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 3 : 1.8;
            } else if (visualMode === 3) {
              // Modo 3: Topológico suave
              const srcTheme = SCIENTIFIC_AREAS[src.area as ScientificArea];
              strokeColor = isConnectedToSelected || isConnectedToHovered
                ? srcTheme?.accentColor
                : theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.4;
            } else if (visualMode === 4) {
              // Modo 4: Editorial com traço fino de nanquim e linhas pontilhadas elegantes
              strokeColor = isConnectedToSelected || isConnectedToHovered
                ? theme === 'dark' ? '#E2E8F0' : '#0F172A'
                : theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.18)';
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 2 : 1;
              if (conn.isInterdisciplinary) strokeDasharray = '4 4';
            } else if (visualMode === 5) {
              // Modo 5: Matriz Cibernética HUD com linhas ciano/neon e pulsos
              strokeColor = isConnectedToSelected || isConnectedToHovered
                ? '#06B6D4'
                : 'rgba(6,182,212,0.35)';
              strokeWidth = isConnectedToSelected || isConnectedToHovered ? 2.5 : 1.2;
              strokeDasharray = conn.isInterdisciplinary ? '6 3' : undefined;
            } else if (visualMode === 6) {
              // Modo 6: Escultura Gravitacional proporcional ao fluxo/atividades
              const activity = conn.activityCount || 1;
              strokeWidth = Math.min(4.5, Math.max(1.2, 1 + activity * 0.45));
              strokeColor = isConnectedToSelected || isConnectedToHovered
                ? '#F59E0B'
                : theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)';
            } else {
              // Modo 1 (Padrão Atual)
              if (isConnectedToSelected || isConnectedToHovered) {
                strokeColor = theme === 'dark' ? '#F8FAFC' : '#0F172A';
                strokeWidth = 2.2;
              } else if (isInTrail) {
                strokeColor = '#6366F1';
                strokeWidth = 2;
              }
            }

            return (
              <g key={conn.id}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                />

                {/* Tag de tipo de conexão em hover no Modo 4 (Editorial) */}
                {visualMode === 4 && (isConnectedToHovered || isConnectedToSelected) && (
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 4}
                    textAnchor="middle"
                    fill={theme === 'dark' ? '#94A3B8' : '#475569'}
                    fontSize="9"
                    fontFamily="Newsreader, serif"
                    fontStyle="italic"
                  >
                    {conn.type}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* =================== 2. CAMADA DE ESFERAS E NÓS =================== */}
        {filteredNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isTrail = focusMode && explorationTrail.includes(node.id);
          const sphereGradient = getSphereGradient(node.area as ScientificArea);
          const nodeSize = getNodeSize(node);

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
                {/* ======================= MODO 1: ORBES PRISMÁTICOS ======================= */}
                {visualMode === 1 && (
                  <div
                    className={`rounded-full bg-gradient-to-br ${sphereGradient} shadow-md transition-transform duration-150 relative flex items-center justify-center ${
                      isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                    }`}
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      boxShadow: isSelected
                        ? `0 0 20px ${areaTheme.accentColor}`
                        : isHovered
                        ? `0 0 14px ${areaTheme.accentColor}`
                        : `0 2px 8px ${areaTheme.glowColor}`
                    }}
                  >
                    <div className="absolute top-1 left-1.5 w-2 h-1.5 rounded-full bg-white/50 blur-[0.5px]" />
                    {isSelected && (
                      <div className="absolute -inset-1.5 rounded-full border-2 border-white dark:border-stone-100" />
                    )}
                    {isTrail && !isSelected && (
                      <div className="absolute -inset-1 rounded-full border border-indigo-400" />
                    )}
                  </div>
                )}

                {/* ======================= MODO 2: CONSTELAÇÃO CÓSMICA ======================= */}
                {visualMode === 2 && (
                  <div className="relative flex items-center justify-center">
                    {/* Anel de halo pulsante */}
                    <div
                      className="absolute -inset-2 rounded-full opacity-60 animate-pulse pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${areaTheme.accentColor} 0%, transparent 75%)`
                      }}
                    />
                    <div
                      className={`rounded-full relative flex items-center justify-center transition-all duration-200 ${
                        isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                      }`}
                      style={{
                        width: `${nodeSize}px`,
                        height: `${nodeSize}px`,
                        background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${areaTheme.accentColor} 55%, #0B0E17 100%)`,
                        boxShadow: `0 0 18px ${areaTheme.accentColor}, 0 0 4px #FFFFFF`
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    </div>
                  </div>
                )}

                {/* ======================= MODO 3: CARTOGRAFIA TOPOLÓGICA ======================= */}
                {visualMode === 3 && (
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute -inset-3 rounded-full opacity-40 blur-md"
                      style={{ backgroundColor: areaTheme.accentColor }}
                    />
                    <div
                      className={`rounded-full border-2 bg-stone-950/90 flex items-center justify-center transition-transform duration-150 ${
                        isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                      }`}
                      style={{
                        width: `${nodeSize}px`,
                        height: `${nodeSize}px`,
                        borderColor: areaTheme.accentColor,
                        boxShadow: `inset 0 0 10px ${areaTheme.accentColor}40`
                      }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: areaTheme.accentColor }}
                      />
                    </div>
                  </div>
                )}

                {/* ======================= MODO 4: EDITORIAL TIPOGRÁFICO ======================= */}
                {visualMode === 4 && (
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`rounded-full border transition-transform duration-150 ${
                        isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                      }`}
                      style={{
                        width: `${nodeSize - 4}px`,
                        height: `${nodeSize - 4}px`,
                        backgroundColor: areaTheme.accentColor,
                        borderColor: '#FFFFFF',
                        boxShadow: `0 2px 10px ${areaTheme.glowColor}`
                      }}
                    />
                    {/* Título editorial sempre visível no modo 4 */}
                    <span className="font-editorial text-[11px] font-semibold text-stone-900 dark:text-stone-200 mt-1 max-w-[130px] text-center leading-tight whitespace-normal drop-shadow-sm">
                      {node.title}
                    </span>
                  </div>
                )}

                {/* ======================= MODO 5: MATRIZ CIBERNÉTICA HUD ======================= */}
                {visualMode === 5 && (
                  <div className="relative flex items-center justify-center">
                    {/* Anel giratório tecnológico */}
                    <div
                      className="absolute -inset-2 rounded-full border border-dashed opacity-75"
                      style={{ borderColor: areaTheme.accentColor }}
                    />
                    <div
                      className={`rounded-lg bg-stone-950 border flex items-center justify-center transition-transform duration-150 ${
                        isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                      }`}
                      style={{
                        width: `${nodeSize - 2}px`,
                        height: `${nodeSize - 2}px`,
                        borderColor: areaTheme.accentColor,
                        boxShadow: `0 0 12px ${areaTheme.accentColor}`
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: areaTheme.accentColor }}
                      />
                    </div>
                    {/* Coordenada HUD em hover */}
                    {(isHovered || isSelected) && (
                      <span className="absolute -top-4 font-mono text-[8px] text-cyan-400 whitespace-nowrap">
                        LOC:[{Math.round(node.x)},{Math.round(node.y)}]
                      </span>
                    )}
                  </div>
                )}

                {/* ======================= MODO 6: ESCULTURA GRAVITACIONAL ======================= */}
                {visualMode === 6 && (
                  <div
                    className={`rounded-full relative flex items-center justify-center transition-transform duration-150 ${
                      isSelected ? 'scale-115' : isHovered ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      background: `radial-gradient(circle at 30% 30%, #FFFFFF 0%, ${areaTheme.accentColor} 60%, #05070B 100%)`,
                      boxShadow: isSelected
                        ? `0 0 24px ${areaTheme.accentColor}`
                        : `0 4px 14px ${areaTheme.glowColor}`
                    }}
                  >
                    <span className="font-mono text-[9px] font-bold text-white drop-shadow">
                      {node.views >= 1000 ? `${(node.views / 1000).toFixed(1)}k` : node.views}
                    </span>
                  </div>
                )}

                {/* Tooltip flutuante de título (para modos 1, 2, 3, 5, 6 quando em hover) */}
                {visualMode !== 4 && (isHovered || isSelected) && (
                  <div className="absolute top-full mt-2 px-2.5 py-1 rounded-xl bg-stone-900/95 text-white dark:bg-stone-100 dark:text-stone-900 text-[11px] font-medium whitespace-nowrap shadow-xl pointer-events-none z-50 flex items-center gap-1.5 border border-white/10">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: areaTheme.accentColor }}
                    />
                    <span>{node.title}</span>
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
