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

  // Modelos de Variações da Barra de Filtragem
  type FilterVariation =
    | 'v1_multiselect'
    | 'v2_ghosting'
    | 'v3_drilldown'
    | 'v4_interdisciplinar'
    | 'v5_keyboard_dock'
    | 'v6_hud_summary';

  const [filterVariation, setFilterVariation] = useState<FilterVariation>('v1_multiselect');
  const [selectedMultiAreas, setSelectedMultiAreas] = useState<ScientificArea[]>([]);
  const [ghostLevel, setGhostLevel] = useState<number>(0.15);
  const [activeSubtopic, setActiveSubtopic] = useState<string | null>(null);
  const [v3BridgeFilter, setV3BridgeFilter] = useState<boolean>(false);
  const [v3BridgeTargetArea, setV3BridgeTargetArea] = useState<ScientificArea | null>(null);
  const [bridgeAreaA, setBridgeAreaA] = useState<ScientificArea>('Biologia');
  const [bridgeAreaB, setBridgeAreaB] = useState<ScientificArea>('Computação');

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

  // Suporte a atalhos de teclado para a Variação 5 (Dock & Teclado)
  useEffect(() => {
    if (filterVariation !== 'v5_keyboard_dock') return;

    const areaList: ScientificArea[] = [
      'Biologia',
      'Química',
      'Física',
      'Computação',
      'Matemática',
      'Humanidades'
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '0') {
        setActiveAreaFilter(null);
        setPan({ x: 0, y: 0 });
      } else {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6) {
          const area = areaList[num - 1];
          setActiveAreaFilter(area);
          const theme = SCIENTIFIC_AREAS[area];
          setPan({
            x: -theme.center.x * zoom,
            y: -theme.center.y * zoom
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filterVariation, zoom, setActiveAreaFilter, setPan]);

  // Lista de subtópicos disponíveis para a variação 3 (Drill-down)
  const availableSubtopics = React.useMemo(() => {
    if (!activeAreaFilter) return [];
    return Array.from(
      new Set(
        nodes
          .filter((n) => n.area === activeAreaFilter)
          .map((n) => n.subtopic)
          .filter(Boolean)
      )
    );
  }, [nodes, activeAreaFilter]);

  // Mapa de nós por ID
  const nodeByIdMap = React.useMemo(() => {
    return new Map(simNodesRef.current.map((n) => [n.id, n]));
  }, [nodes, connections]);

  // Áreas externas conectadas à área ativa na Variação 3 (para filtro de pontes)
  const connectedBridgeAreas = React.useMemo(() => {
    if (!activeAreaFilter) {
      return Object.keys(SCIENTIFIC_AREAS) as ScientificArea[];
    }
    const set = new Set<ScientificArea>();
    connections.forEach((c) => {
      const srcId = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgtId = typeof c.target === 'object' ? (c.target as any).id : c.target;
      const src = nodeByIdMap.get(srcId);
      const tgt = nodeByIdMap.get(tgtId);
      if (!src || !tgt) return;

      if (src.area === activeAreaFilter && tgt.area !== activeAreaFilter) {
        if (!activeSubtopic || src.subtopic === activeSubtopic) {
          set.add(tgt.area);
        }
      } else if (tgt.area === activeAreaFilter && src.area !== activeAreaFilter) {
        if (!activeSubtopic || tgt.subtopic === activeSubtopic) {
          set.add(src.area);
        }
      }
    });
    return Array.from(set);
  }, [activeAreaFilter, activeSubtopic, connections, nodeByIdMap]);

  // Nós participantes de pontes na Variação 3
  const v3BridgeNodeIds = React.useMemo(() => {
    if (filterVariation !== 'v3_drilldown' || !v3BridgeFilter) {
      return new Set<string>();
    }
    const set = new Set<string>();
    connections.forEach((c) => {
      const srcId = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgtId = typeof c.target === 'object' ? (c.target as any).id : c.target;
      const src = nodeByIdMap.get(srcId);
      const tgt = nodeByIdMap.get(tgtId);
      if (!src || !tgt) return;
      if (src.area === tgt.area) return;

      if (activeAreaFilter) {
        const hasActiveArea = src.area === activeAreaFilter || tgt.area === activeAreaFilter;
        if (!hasActiveArea) return;

        if (activeSubtopic) {
          const activeNode = src.area === activeAreaFilter ? src : tgt;
          if (activeNode.subtopic !== activeSubtopic) return;
        }

        if (v3BridgeTargetArea) {
          const hasTarget = src.area === v3BridgeTargetArea || tgt.area === v3BridgeTargetArea;
          if (!hasTarget) return;
        }
      } else {
        if (v3BridgeTargetArea) {
          const hasTarget = src.area === v3BridgeTargetArea || tgt.area === v3BridgeTargetArea;
          if (!hasTarget) return;
        }
      }

      set.add(srcId);
      set.add(tgtId);
    });
    return set;
  }, [
    filterVariation,
    v3BridgeFilter,
    activeAreaFilter,
    activeSubtopic,
    v3BridgeTargetArea,
    connections,
    nodeByIdMap
  ]);

  // Identificação de nós de pontes interdisciplinares para Variação 4
  const bridgeNodeIds = React.useMemo(() => {
    if (filterVariation !== 'v4_interdisciplinar' || !bridgeAreaA || !bridgeAreaB) {
      return new Set<string>();
    }
    const set = new Set<string>();
    connections.forEach((c) => {
      const srcId = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgtId = typeof c.target === 'object' ? (c.target as any).id : c.target;
      const src = nodeByIdMap.get(srcId);
      const tgt = nodeByIdMap.get(tgtId);
      if (!src || !tgt) return;
      if (
        (src.area === bridgeAreaA && tgt.area === bridgeAreaB) ||
        (src.area === bridgeAreaB && tgt.area === bridgeAreaA)
      ) {
        set.add(srcId);
        set.add(tgtId);
      }
    });
    return set;
  }, [filterVariation, bridgeAreaA, bridgeAreaB, connections, nodeByIdMap]);

  // Separação de nós visíveis e nós em modo ghost
  const { visibleNodes, ghostedNodeIds } = React.useMemo(() => {
    const ghosted = new Set<string>();

    const filtered = simNodesRef.current.filter((n) => {
      // 1. Busca textual global
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchAuthor = n.author.name.toLowerCase().includes(q);
        const matchTags = n.tags?.some((t: string) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchTags) return false;
      }

      // 2. Variação 1: Multisseleção
      if (filterVariation === 'v1_multiselect') {
        if (selectedMultiAreas.length > 0) {
          return selectedMultiAreas.includes(n.area);
        }
        return true;
      }

      // 3. Variação 2: Ghosting / Foco
      if (filterVariation === 'v2_ghosting') {
        if (activeAreaFilter) {
          if (n.area !== activeAreaFilter) {
            ghosted.add(n.id);
          }
        }
        return true;
      }

      // 4. Variação 3: Drill-down por Subtópico + Pontes entre Campos
      if (filterVariation === 'v3_drilldown') {
        if (v3BridgeFilter) {
          return v3BridgeNodeIds.has(n.id);
        }
        if (activeAreaFilter) {
          if (n.area !== activeAreaFilter) return false;
          if (activeSubtopic && n.subtopic !== activeSubtopic) return false;
        }
        return true;
      }

      // 5. Variação 4: Pontes Interdisciplinares
      if (filterVariation === 'v4_interdisciplinar') {
        if (bridgeAreaA && bridgeAreaB) {
          return bridgeNodeIds.has(n.id);
        }
        return true;
      }

      // 6. Variações 5 (Dock) e 6 (HUD): filtro direto de área
      if (activeAreaFilter) {
        return n.area === activeAreaFilter;
      }

      return true;
    });

    return { visibleNodes: filtered, ghostedNodeIds: ghosted };
  }, [
    simNodesRef.current,
    filterVariation,
    selectedMultiAreas,
    activeAreaFilter,
    activeSubtopic,
    bridgeAreaA,
    bridgeAreaB,
    searchQuery,
    bridgeNodeIds
  ]);

  const visibleNodeMap = React.useMemo(() => {
    const map = new Map<string, any>();
    visibleNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [visibleNodes]);

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
      {/* ========================================================= */}
      {/* SELETOR DE TAGS E VARIAÇÕES NO CANTO SUPERIOR ESQUERDO   */}
      {/* ========================================================= */}
      <div
        className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 pointer-events-auto max-w-[calc(100vw-3rem)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-xl max-w-xl transition-all">
          
          {/* Seletor de Modelo / Variação */}
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-stone-200/80 dark:border-stone-800/80 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mr-1 shrink-0">
              Variações da Barra:
            </span>
            {[
              { id: 'v1_multiselect', label: '1. Multisseleção' },
              { id: 'v2_ghosting', label: '2. Foco & Ghosting' },
              { id: 'v3_drilldown', label: '3. Subtópicos' },
              { id: 'v4_interdisciplinar', label: '4. Interdisciplinar' },
              { id: 'v5_keyboard_dock', label: '5. Dock & Teclas' },
              { id: 'v6_hud_summary', label: '6. Card HUD' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setFilterVariation(v.id as FilterVariation);
                  setActiveSubtopic(null);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                  filterVariation === v.id
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Legenda com a frase obrigatória */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-stone-500" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
              selecione qual área de artigos você quer ver
            </span>

            {/* Badge de contexto da variação */}
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono bg-stone-100 dark:bg-stone-800 text-stone-500">
              {filterVariation === 'v1_multiselect' && 'Multi-tags'}
              {filterVariation === 'v2_ghosting' && 'Modo Ghost'}
              {filterVariation === 'v3_drilldown' && 'Área ➔ Subtópico'}
              {filterVariation === 'v4_interdisciplinar' && 'Ponte A ⟷ B'}
              {filterVariation === 'v5_keyboard_dock' && 'Atalhos 1 a 6'}
              {filterVariation === 'v6_hud_summary' && 'Sumário da Área'}
            </span>
          </div>

          {/* ======================================================== */}
          {/* VARIAÇÃO 1: MULTISSELEÇÃO COMBINADA                      */}
          {/* ======================================================== */}
          {filterVariation === 'v1_multiselect' && (
            <div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => setSelectedMultiAreas([])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedMultiAreas.length === 0
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  Todas as áreas
                </button>

                {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
                  const areaTheme = SCIENTIFIC_AREAS[area];
                  const isSelected = selectedMultiAreas.includes(area);
                  const count = nodes.filter((n) => n.area === area).length;

                  return (
                    <button
                      key={area}
                      onClick={() => {
                        setSelectedMultiAreas((prev) =>
                          prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
                        );
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-stone-900'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                      style={{
                        backgroundColor: isSelected ? areaTheme.accentColor : undefined
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : areaTheme.accentColor }}
                      />
                      <span>{area}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                          isSelected
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

              {selectedMultiAreas.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    Exibindo artigos de <strong>{selectedMultiAreas.length}</strong> áreas combinadas ({visibleNodes.length} artigos)
                  </span>
                  <button
                    onClick={() => setSelectedMultiAreas([])}
                    className="underline text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-medium"
                  >
                    Resetar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIAÇÃO 2: FOCO ESPACIAL & GHOSTING (ATENUAÇÃO)         */}
          {/* ======================================================== */}
          {filterVariation === 'v2_ghosting' && (
            <div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => {
                    setActiveAreaFilter(null);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeAreaFilter === null
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  Todas (100% visíveis)
                </button>

                {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
                  const areaTheme = SCIENTIFIC_AREAS[area];
                  const isActive = activeAreaFilter === area;

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
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                      style={{
                        backgroundColor: isActive ? areaTheme.accentColor : undefined
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isActive ? '#FFFFFF' : areaTheme.accentColor }}
                      />
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slider de Opacidade Fantasma */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span>Opacidade dos nós secundários:</span>
                  <strong className="font-mono text-stone-700 dark:text-stone-300">
                    {Math.round(ghostLevel * 100)}%
                  </strong>
                </span>
                <div className="flex gap-1">
                  {[0.05, 0.15, 0.35].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setGhostLevel(lvl)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        ghostLevel === lvl
                          ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {Math.round(lvl * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIAÇÃO 3: DRILL-DOWN EM CASCATA (ÁREA + SUBTÓPICOS + PONTES) */}
          {/* ======================================================== */}
          {filterVariation === 'v3_drilldown' && (
            <div className="space-y-2.5">
              {/* Linha 1: Áreas */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => {
                    setActiveAreaFilter(null);
                    setActiveSubtopic(null);
                    setV3BridgeFilter(false);
                    setV3BridgeTargetArea(null);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeAreaFilter === null
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  Todas
                </button>

                {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
                  const areaTheme = SCIENTIFIC_AREAS[area];
                  const isActive = activeAreaFilter === area;

                  return (
                    <button
                      key={area}
                      onClick={() => {
                        if (isActive) {
                          setActiveAreaFilter(null);
                          setActiveSubtopic(null);
                          setV3BridgeTargetArea(null);
                          setPan({ x: 0, y: 0 });
                        } else {
                          setActiveAreaFilter(area);
                          setActiveSubtopic(null);
                          setV3BridgeTargetArea(null);
                          setPan({
                            x: -areaTheme.center.x * zoom,
                            y: -areaTheme.center.y * zoom
                          });
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-stone-900'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                      style={{
                        backgroundColor: isActive ? areaTheme.accentColor : undefined
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isActive ? '#FFFFFF' : areaTheme.accentColor }}
                      />
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>

              {/* Linha 2: Subtópicos da Área Ativa */}
              {activeAreaFilter && availableSubtopics.length > 0 && (
                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
                  <div className="text-[10px] uppercase font-bold text-stone-500 mb-1.5 flex items-center justify-between">
                    <span>Subtópicos de {activeAreaFilter}:</span>
                    {activeSubtopic && (
                      <button
                        onClick={() => setActiveSubtopic(null)}
                        className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline font-normal"
                      >
                        Limpar subtópico
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setActiveSubtopic(null)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        activeSubtopic === null
                          ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      Todos os subtópicos
                    </button>
                    {availableSubtopics.map((sub) => {
                      const isSubActive = activeSubtopic === sub;
                      const count = nodes.filter(
                        (n) => n.area === activeAreaFilter && n.subtopic === sub
                      ).length;

                      return (
                        <button
                          key={sub}
                          onClick={() => setActiveSubtopic(isSubActive ? null : sub)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isSubActive
                              ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 ring-1 ring-stone-900'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          <span>{sub}</span>
                          <span className="opacity-60 font-mono text-[9px]">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linha 3: Filtro de Pontes entre Campos (Interdisciplinaridade) */}
              <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-600 dark:text-stone-300">
                    Pontes entre campos:
                  </span>
                  {v3BridgeFilter && (
                    <button
                      onClick={() => {
                        setV3BridgeFilter(false);
                        setV3BridgeTargetArea(null);
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline font-normal"
                    >
                      Desativar pontes
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {/* Botão Geral de Pontes */}
                  <button
                    onClick={() => {
                      if (v3BridgeFilter && v3BridgeTargetArea === null) {
                        setV3BridgeFilter(false);
                      } else {
                        setV3BridgeFilter(true);
                        setV3BridgeTargetArea(null);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      v3BridgeFilter && v3BridgeTargetArea === null
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <span>🔗</span>
                    <span>Apenas pontes entre campos</span>
                  </button>

                  {/* Tags com outros campos conectados */}
                  {connectedBridgeAreas.map((targetArea) => {
                    const isTargetActive = v3BridgeFilter && v3BridgeTargetArea === targetArea;
                    const targetTheme = SCIENTIFIC_AREAS[targetArea];

                    return (
                      <button
                        key={`v3-bridge-${targetArea}`}
                        onClick={() => {
                          if (isTargetActive) {
                            setV3BridgeTargetArea(null);
                          } else {
                            setV3BridgeFilter(true);
                            setV3BridgeTargetArea(targetArea);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isTargetActive
                            ? 'text-white shadow-sm ring-1 ring-white/50'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                        style={{
                          backgroundColor: isTargetActive ? targetTheme.accentColor : undefined
                        }}
                      >
                        <span className="text-[10px] opacity-75">➔</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isTargetActive ? '#FFFFFF' : targetTheme.accentColor
                          }}
                        />
                        <span>Ponte c/ {targetArea}</span>
                      </button>
                    );
                  })}
                </div>

                {v3BridgeFilter && (
                  <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center justify-between">
                    <span>
                      {v3BridgeTargetArea
                        ? `Filtrando artigos que conectam ${activeAreaFilter || 'qualquer área'} com ${v3BridgeTargetArea}`
                        : `Exibindo apenas artigos que cruzam fronteiras entre áreas`}
                    </span>
                    <span className="font-mono font-semibold">
                      ({visibleNodes.length} artigos)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIAÇÃO 4: PONTES INTERDISCIPLINARES (DE ➔ PARA)       */}
          {/* ======================================================== */}
          {filterVariation === 'v4_interdisciplinar' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Área A */}
                <div className="flex-1 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">
                    Área Origem:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => (
                      <button
                        key={`from-${area}`}
                        onClick={() => setBridgeAreaA(area)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                          bridgeAreaA === area
                            ? 'text-white'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                        style={{
                          backgroundColor:
                            bridgeAreaA === area
                              ? SCIENTIFIC_AREAS[area].accentColor
                              : undefined
                        }}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center font-bold text-stone-400">⟷</div>

                {/* Área B */}
                <div className="flex-1 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">
                    Conectada Com:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => (
                      <button
                        key={`to-${area}`}
                        onClick={() => setBridgeAreaB(area)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                          bridgeAreaB === area
                            ? 'text-white'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                        style={{
                          backgroundColor:
                            bridgeAreaB === area
                              ? SCIENTIFIC_AREAS[area].accentColor
                              : undefined
                        }}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-1.5 flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  Mostrando pontes entre <strong>{bridgeAreaA}</strong> e <strong>{bridgeAreaB}</strong>
                </span>
                <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                  {visibleNodes.length} artigos interdisciplinares
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIAÇÃO 5: DOCK MINIMALISTA & ATALHOS DE TECLADO       */}
          {/* ======================================================== */}
          {filterVariation === 'v5_keyboard_dock' && (
            <div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => {
                    setActiveAreaFilter(null);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    activeAreaFilter === null
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                  title="Pressione [0] no teclado"
                >
                  <span className="px-1 py-0.2 bg-black/20 dark:bg-stone-300/40 rounded text-[9px]">0</span>
                  <span>Todas</span>
                </button>

                {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area, idx) => {
                  const areaTheme = SCIENTIFIC_AREAS[area];
                  const isActive = activeAreaFilter === area;

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
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-stone-900'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                      style={{
                        backgroundColor: isActive ? areaTheme.accentColor : undefined
                      }}
                      title={`Pressione [${idx + 1}] no teclado`}
                    >
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                          isActive
                            ? 'bg-black/25 text-white'
                            : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                <span>Dica: Pressione as teclas <strong>1</strong> a <strong>6</strong> (ou <strong>0</strong>) no teclado físico para alternar instantaneamente!</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VARIAÇÃO 6: CARD HUD DE EXPLORAÇÃO COM RESUMO           */}
          {/* ======================================================== */}
          {filterVariation === 'v6_hud_summary' && (
            <div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => {
                    setActiveAreaFilter(null);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeAreaFilter === null
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  Geral
                </button>

                {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
                  const areaTheme = SCIENTIFIC_AREAS[area];
                  const isActive = activeAreaFilter === area;

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
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                      style={{
                        backgroundColor: isActive ? areaTheme.accentColor : undefined
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isActive ? '#FFFFFF' : areaTheme.accentColor }}
                      />
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>

              {/* Card HUD Informativo */}
              {activeAreaFilter ? (
                <div
                  className="mt-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: SCIENTIFIC_AREAS[activeAreaFilter].accentColor
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                      {SCIENTIFIC_AREAS[activeAreaFilter].label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      {nodes.filter((n) => n.area === activeAreaFilter).length} artigos indexados
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                    {SCIENTIFIC_AREAS[activeAreaFilter].description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const first = nodes.find((n) => n.area === activeAreaFilter);
                        if (first) setSelectedNodeId(first.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: SCIENTIFIC_AREAS[activeAreaFilter].accentColor
                      }}
                    >
                      Ler artigo destaque da área ➔
                    </button>
                    <button
                      onClick={() => {
                        setActiveAreaFilter(null);
                        setPan({ x: 0, y: 0 });
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline"
                    >
                      Ver todas as áreas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-stone-400">
                  Clique em qualquer área acima para abrir o raio-x e resumo do cluster.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* PLANO DE COORDENADAS DO GRAFO                            */}
      {/* ========================================================= */}
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

            const isSrcGhost = ghostedNodeIds.has(src.id);
            const isTgtGhost = ghostedNodeIds.has(tgt.id);
            const isGhostLine = isSrcGhost || isTgtGhost;

            const isConnectedToSelected =
              selectedNodeId && (src.id === selectedNodeId || tgt.id === selectedNodeId);
            const isConnectedToHovered =
              hoveredNodeId && (src.id === hoveredNodeId || tgt.id === hoveredNodeId);
            const isInTrail =
              focusMode && explorationTrail.includes(src.id) && explorationTrail.includes(tgt.id);

            // Destaque para conexões de ponte interdisciplinar na Variação 3 ou Variação 4
            const isV3BridgeConn =
              filterVariation === 'v3_drilldown' &&
              v3BridgeFilter &&
              src.area !== tgt.area &&
              (!activeAreaFilter || src.area === activeAreaFilter || tgt.area === activeAreaFilter) &&
              (!v3BridgeTargetArea || src.area === v3BridgeTargetArea || tgt.area === v3BridgeTargetArea);

            const isBridgeConn =
              (filterVariation === 'v4_interdisciplinar' &&
                bridgeAreaA &&
                bridgeAreaB &&
                ((src.area === bridgeAreaA && tgt.area === bridgeAreaB) ||
                  (src.area === bridgeAreaB && tgt.area === bridgeAreaA))) ||
              Boolean(isV3BridgeConn);

            // Linha com cor chapada limpa
            let strokeColor = isConnectedToSelected || isConnectedToHovered
              ? theme === 'dark'
                ? '#F8FAFC'
                : '#0F172A'
              : isBridgeConn
              ? '#F59E0B'
              : isInTrail
              ? '#6366F1'
              : theme === 'dark'
              ? '#272E3F'
              : '#CBD5E1';

            let strokeWidth = isBridgeConn
              ? 2.6
              : isConnectedToSelected || isConnectedToHovered
              ? 2
              : 1.2;

            if (isGhostLine) {
              strokeColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
              strokeWidth = 0.8;
            }

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

        {/* Camada de Esferas em Cores Chapadas */}
        {visibleNodes.map((node) => {
          const areaTheme = SCIENTIFIC_AREAS[node.area as ScientificArea];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isGhost = ghostedNodeIds.has(node.id);

          return (
            <div
              key={node.id}
              onMouseDown={(e) => {
                if (isGhost) return;
                e.stopPropagation();
                if (e.button !== 0) return;
                draggedNodeIdRef.current = node.id;
                didMoveNodeRef.current = false;
                node.fx = node.x;
                node.fy = node.y;
              }}
              onClick={(e) => {
                if (isGhost) return;
                e.stopPropagation();
                if (!didMoveNodeRef.current) {
                  setSelectedNodeId(node.id);
                }
              }}
              onMouseEnter={() => !isGhost && setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-opacity duration-200 ${
                isGhost ? 'cursor-default pointer-events-none' : 'cursor-pointer'
              } ${isSelected ? 'z-40' : isHovered ? 'z-30' : isGhost ? 'z-10' : 'z-20'}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                opacity: isGhost ? ghostLevel : 1
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Esfera em Cor Chapada */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform duration-150 flex items-center justify-center ${
                    isSelected
                      ? 'scale-125'
                      : isHovered
                      ? 'scale-115'
                      : isGhost
                      ? 'scale-90'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: isGhost
                      ? theme === 'dark'
                        ? '#334155'
                        : '#94A3B8'
                      : areaTheme.accentColor,
                    border: isSelected
                      ? '3px solid #FFFFFF'
                      : isHovered
                      ? '2px solid rgba(255, 255, 255, 0.8)'
                      : 'none'
                  }}
                />

                {/* Tooltip do Nó em Hover (apenas para nós ativos) */}
                {!isGhost && (isHovered || isSelected) && (
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
