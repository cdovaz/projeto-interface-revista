import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export const KnowledgeMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [, setTick] = useState(0);

  const {
    nodes,
    connections,
    selectedNodeId,
    setSelectedNodeId,
    activeAreaFilter,
    setActiveAreaFilter,
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

  // Similaridade temática entre dois nós
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
      .force('collide', d3.forceCollide().radius(24).strength(0.9))
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
      {/* Seletor de Tags no Canto Superior Esquerdo */}
      <div
        className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 pointer-events-auto max-w-[calc(100vw-3rem)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-stone-200 dark:border-stone-800 shadow-xl">
          {/* Legenda com a frase solicitada */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500" />
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 tracking-tight">
              selecione qual área de artigos você quer ver
            </span>
            {activeAreaFilter && (
              <button
                onClick={() => {
                  setActiveAreaFilter(null);
                  setPan({ x: 0, y: 0 });
                }}
                className="ml-auto text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline font-medium transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Tags de cada Área com cores chapadas */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Tag para ver todas */}
            <button
              onClick={() => {
                setActiveAreaFilter(null);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeAreaFilter === null
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
              }`}
            >
              Todas
            </button>

            {/* Tags individuais por área de conhecimento */}
            {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
              const areaTheme = SCIENTIFIC_AREAS[area];
              const isActive = activeAreaFilter === area;
              const count = nodes.filter((n) => n.area === area).length;

              return (
                <button
                  key={area}
                  onClick={() => {
                    if (isActive) {
                      setActiveAreaFilter(null);
                      setPan({ x: 0, y: 0 });
                    } else {
                      setActiveAreaFilter(area);
                      setPan({
                        x: -areaTheme.center.x * zoom,
                        y: -areaTheme.center.y * zoom
                      });
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-stone-900'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700/80 border border-transparent'
                  }`}
                  style={{
                    backgroundColor: isActive ? areaTheme.accentColor : undefined,
                    borderColor: isActive ? areaTheme.accentColor : undefined
                  }}
                >
                  {/* Ponto colorido chapado */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive ? '#FFFFFF' : areaTheme.accentColor
                    }}
                  />
                  <span>{area}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-stone-200/70 text-stone-500 dark:bg-stone-700 dark:text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plano de Coordenadas do Grafo */}
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          transform: `translate3d(${containerSize.width / 2 + pan.x}px, ${
            containerSize.height / 2 + pan.y
          }px, 0) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Camada SVG de Conexões em Cores Chapadas */}
        <svg
          className="overflow-visible absolute left-0 top-0 pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
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

            // Linha com cor chapada limpa
            const strokeColor = isConnectedToSelected || isConnectedToHovered
              ? theme === 'dark'
                ? '#F8FAFC'
                : '#0F172A'
              : isInTrail
              ? '#6366F1'
              : theme === 'dark'
              ? '#272E3F'
              : '#CBD5E1';

            const strokeWidth = isConnectedToSelected || isConnectedToHovered ? 2 : 1.2;

            return (
              <line
                key={`line-${conn.id}`}
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

        {/* Camada de Esferas em Cores Chapadas (Flat Solid Colors, sem degradê) */}
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
                {/* Esfera em Cor Chapada Pura */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform duration-150 flex items-center justify-center ${
                    isSelected ? 'scale-125' : isHovered ? 'scale-115' : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: areaTheme.accentColor,
                    border: isSelected
                      ? '3px solid #FFFFFF'
                      : isHovered
                      ? '2px solid rgba(255, 255, 255, 0.8)'
                      : 'none'
                  }}
                />

                {/* Tooltip do Nó em Hover */}
                {(isHovered || isSelected) && (
                  <div className="absolute top-full mt-2 px-2.5 py-1 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[11px] font-medium whitespace-nowrap shadow-md pointer-events-none z-50 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
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
