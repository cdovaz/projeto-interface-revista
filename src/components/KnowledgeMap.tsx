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

  // Estados de filtragem definitiva (Baseada no modelo Subtópicos & Áreas Múltiplas)
  const [selectedAreas, setSelectedAreas] = useState<ScientificArea[]>(['Biologia']);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [bridgeTargetArea, setBridgeTargetArea] = useState<ScientificArea | null>(null);

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

  // Lista de subtópicos disponíveis (suporta seleção de múltiplas áreas)
  const availableSubtopics = React.useMemo(() => {
    const targetAreas =
      selectedAreas.length > 0
        ? selectedAreas
        : (Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]);

    return Array.from(
      new Set(
        nodes
          .filter((n) => targetAreas.includes(n.area))
          .map((n) => n.subtopic)
          .filter(Boolean)
      )
    );
  }, [nodes, selectedAreas]);

  // Mapa de nós por ID
  const nodeByIdMap = React.useMemo(() => {
    return new Map(simNodesRef.current.map((n) => [n.id, n]));
  }, [nodes, connections]);

  // Áreas externas conectadas às áreas e tags ativas (só se 2+ tags marcadas)
  const connectedBridgeAreas = React.useMemo(() => {
    if (selectedSubtopics.length < 2) {
      return [];
    }
    const targetAreas =
      selectedAreas.length > 0
        ? selectedAreas
        : (Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]);

    const set = new Set<ScientificArea>();
    connections.forEach((c) => {
      const srcId = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgtId = typeof c.target === 'object' ? (c.target as any).id : c.target;
      const src = nodeByIdMap.get(srcId);
      const tgt = nodeByIdMap.get(tgtId);
      if (!src || !tgt) return;

      const srcInSelected = targetAreas.includes(src.area) && selectedSubtopics.includes(src.subtopic);
      const tgtInSelected = targetAreas.includes(tgt.area) && selectedSubtopics.includes(tgt.subtopic);

      if (srcInSelected && !targetAreas.includes(tgt.area)) {
        set.add(tgt.area);
      } else if (tgtInSelected && !targetAreas.includes(src.area)) {
        set.add(src.area);
      }
    });
    return Array.from(set);
  }, [selectedAreas, selectedSubtopics, connections, nodeByIdMap]);

  // Nós participantes de pontes (só ativos se 2 ou mais tags de subtópicos forem marcadas)
  const bridgeNodeIds = React.useMemo(() => {
    if (selectedSubtopics.length < 2) {
      return new Set<string>();
    }
    const targetAreas =
      selectedAreas.length > 0
        ? selectedAreas
        : (Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]);

    const set = new Set<string>();
    connections.forEach((c) => {
      const srcId = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgtId = typeof c.target === 'object' ? (c.target as any).id : c.target;
      const src = nodeByIdMap.get(srcId);
      const tgt = nodeByIdMap.get(tgtId);
      if (!src || !tgt) return;

      const srcInSelected = targetAreas.includes(src.area) && selectedSubtopics.includes(src.subtopic);
      const tgtInSelected = targetAreas.includes(tgt.area) && selectedSubtopics.includes(tgt.subtopic);

      // 1. Pontes internas entre dois subtópicos diferentes marcados
      const isCrossSubtopicBridge =
        srcInSelected && tgtInSelected && (src.subtopic !== tgt.subtopic || src.area !== tgt.area);

      // 2. Pontes que cruzam para outro campo externo conectado
      const isCrossFieldBridge =
        (srcInSelected && !targetAreas.includes(tgt.area) && (!bridgeTargetArea || tgt.area === bridgeTargetArea)) ||
        (tgtInSelected && !targetAreas.includes(src.area) && (!bridgeTargetArea || src.area === bridgeTargetArea));

      if (isCrossSubtopicBridge || isCrossFieldBridge) {
        set.add(srcId);
        set.add(tgtId);
      }
    });
    return set;
  }, [
    selectedAreas,
    selectedSubtopics,
    bridgeTargetArea,
    connections,
    nodeByIdMap
  ]);

  // Nós visíveis filtrados
  const visibleNodes = React.useMemo(() => {
    const targetAreas = selectedAreas.length > 0 ? selectedAreas : null;

    return simNodesRef.current.filter((n) => {
      // 1. Busca textual global
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchAuthor = n.author.name.toLowerCase().includes(q);
        const matchTags = n.tags?.some((t: string) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchTags) return false;
      }

      // 2. Se 2 ou mais tags marcadas:
      if (selectedSubtopics.length >= 2) {
        const isMarkedSubtopic =
          (!targetAreas || targetAreas.includes(n.area)) && selectedSubtopics.includes(n.subtopic);
        const isBridgeParticipant = bridgeNodeIds.has(n.id);
        return isMarkedSubtopic || isBridgeParticipant;
      }

      // 3. Se 1 tag marcada:
      if (selectedSubtopics.length === 1) {
        return (!targetAreas || targetAreas.includes(n.area)) && selectedSubtopics.includes(n.subtopic);
      }

      // 4. Se 0 tags marcadas: mostra nós das áreas selecionadas (ou todas se nenhuma selecionada)
      return !targetAreas || targetAreas.includes(n.area);
    });
  }, [
    simNodesRef.current,
    selectedAreas,
    selectedSubtopics,
    bridgeNodeIds,
    searchQuery
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
      {/* PAINEL DEFINITIVO DE FILTRAGEM NO CANTO SUPERIOR ESQUERDO */}
      {/* ========================================================= */}
      <div
        className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 pointer-events-auto max-w-[calc(100vw-3rem)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-xl max-w-xl transition-all space-y-2.5">
          
          {/* Legenda Exata Obrigatória */}
          <div className="flex items-center gap-2 pb-1 border-b border-stone-200/80 dark:border-stone-800/80">
            <span className="w-2 h-2 rounded-full bg-stone-500" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 tracking-tight">
              selecione qual área de artigos você quer ver
            </span>
          </div>

          {/* Linha 1: Áreas de Conhecimento (Multi-seleção de Áreas) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-[10px] uppercase font-bold text-stone-500">
              <div className="flex items-center gap-1.5">
                <span>Áreas de Artigos:</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                    selectedAreas.length > 0
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                  }`}
                >
                  {selectedAreas.length === 0
                    ? 'Todas ativas'
                    : `${selectedAreas.length} selecionada${selectedAreas.length !== 1 ? 's' : ''}`}
                </span>
              </div>

              {selectedAreas.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedAreas([]);
                    setSelectedSubtopics([]);
                    setBridgeTargetArea(null);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline font-normal"
                >
                  Ver todas
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                onClick={() => {
                  setSelectedAreas([]);
                  setSelectedSubtopics([]);
                  setBridgeTargetArea(null);
                  setPan({ x: 0, y: 0 });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedAreas.length === 0
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                }`}
              >
                Todas as áreas
              </button>

              {(Object.keys(SCIENTIFIC_AREAS) as ScientificArea[]).map((area) => {
                const areaTheme = SCIENTIFIC_AREAS[area];
                const isAreaSelected = selectedAreas.includes(area);
                const count = nodes.filter((n) => n.area === area).length;

                return (
                  <button
                    key={area}
                    onClick={() => {
                      setSelectedAreas((prev) => {
                        const next = prev.includes(area)
                          ? prev.filter((a) => a !== area)
                          : [...prev, area];

                        if (next.length === 1) {
                          const center = SCIENTIFIC_AREAS[next[0]].center;
                          setPan({ x: -center.x * zoom, y: -center.y * zoom });
                        } else if (next.length > 1) {
                          const avgX =
                            next.reduce((sum, a) => sum + SCIENTIFIC_AREAS[a].center.x, 0) /
                            next.length;
                          const avgY =
                            next.reduce((sum, a) => sum + SCIENTIFIC_AREAS[a].center.y, 0) /
                            next.length;
                          setPan({ x: -avgX * zoom, y: -avgY * zoom });
                        } else {
                          setPan({ x: 0, y: 0 });
                        }

                        return next;
                      });
                      setSelectedSubtopics([]);
                      setBridgeTargetArea(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isAreaSelected
                        ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-stone-900'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                    style={{
                      backgroundColor: isAreaSelected ? areaTheme.accentColor : undefined
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isAreaSelected ? '#FFFFFF' : areaTheme.accentColor
                      }}
                    />
                    <span>{area}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isAreaSelected
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

          {/* Linha 2: Tags / Subtópicos das Áreas Selecionadas */}
          {availableSubtopics.length > 0 && (
            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
              <div className="text-[10px] uppercase font-bold text-stone-500 mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Tags / Subtópicos:</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                      selectedSubtopics.length >= 2
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                    }`}
                  >
                    {selectedSubtopics.length} selecionada{selectedSubtopics.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {selectedSubtopics.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedSubtopics([]);
                      setBridgeTargetArea(null);
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline font-normal"
                  >
                    Limpar tags
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {availableSubtopics.map((sub) => {
                  const isSubActive = selectedSubtopics.includes(sub);
                  const matchingNode = nodes.find((n) => n.subtopic === sub);
                  const areaOfSub = matchingNode?.area;
                  const subTheme = areaOfSub ? SCIENTIFIC_AREAS[areaOfSub] : null;
                  const count = nodes.filter(
                    (n) =>
                      (selectedAreas.length === 0 || selectedAreas.includes(n.area)) &&
                      n.subtopic === sub
                  ).length;

                  return (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubtopics((prev) =>
                          prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                        isSubActive
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm ring-1 ring-stone-900 dark:ring-stone-100'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSubActive
                            ? '#F59E0B'
                            : subTheme
                            ? subTheme.accentColor
                            : '#78716C'
                        }}
                      />
                      <span>{sub}</span>
                      {areaOfSub && selectedAreas.length !== 1 && (
                        <span className="text-[9px] opacity-50 font-mono">
                          ({areaOfSub.slice(0, 3)})
                        </span>
                      )}
                      <span className="opacity-60 font-mono text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linha 3: Pontes (só aparecem se os usuários marcarem 2 tags ou mais) */}
          <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
            {selectedSubtopics.length < 2 ? (
              <div className="py-2 px-3 rounded-xl bg-stone-100/70 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-2">
                  <span className="text-base">🌉</span>
                  <span>
                    Marque <strong>2 tags ou mais</strong> para revelar as pontes de conexão entre tópicos e campos
                  </span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold">
                  {selectedSubtopics.length}/2 tags
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🌉</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                      Pontes Reveladas ({selectedSubtopics.length} tags marcadas):
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    {bridgeNodeIds.size} artigos conectados em pontes
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <button
                    onClick={() => setBridgeTargetArea(null)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      bridgeTargetArea === null
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                    }`}
                  >
                    <span>🔗</span>
                    <span>Todas as pontes ativas</span>
                  </button>

                  {connectedBridgeAreas.map((targetArea) => {
                    const isTargetActive = bridgeTargetArea === targetArea;
                    const targetTheme = SCIENTIFIC_AREAS[targetArea];

                    return (
                      <button
                        key={`bridge-${targetArea}`}
                        onClick={() => {
                          setBridgeTargetArea(isTargetActive ? null : targetArea);
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

                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  {bridgeTargetArea
                    ? `● Exibindo pontes entre as tags marcadas e o campo de ${bridgeTargetArea}`
                    : `● Exibindo pontes entre os subtópicos marcados (mesma área ou interdisciplinares)`}
                </div>
              </div>
            )}
          </div>
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

            const isConnectedToSelected =
              selectedNodeId && (src.id === selectedNodeId || tgt.id === selectedNodeId);
            const isConnectedToHovered =
              hoveredNodeId && (src.id === hoveredNodeId || tgt.id === hoveredNodeId);
            const isInTrail =
              focusMode && explorationTrail.includes(src.id) && explorationTrail.includes(tgt.id);

            // Destaque para conexões de ponte (só se 2+ tags marcadas)
            const targetAreas = selectedAreas.length > 0 ? selectedAreas : null;
            const isBridgeConn =
              selectedSubtopics.length >= 2 &&
              (
                // 1. Ponte entre dois subtópicos diferentes marcados
                ((!targetAreas || (targetAreas.includes(src.area) && targetAreas.includes(tgt.area))) &&
                  (src.subtopic !== tgt.subtopic || src.area !== tgt.area) &&
                  selectedSubtopics.includes(src.subtopic) &&
                  selectedSubtopics.includes(tgt.subtopic)) ||
                // 2. Ponte que cruza para outro campo científico externo
                ((((!targetAreas || targetAreas.includes(src.area)) && selectedSubtopics.includes(src.subtopic) && (!targetAreas || !targetAreas.includes(tgt.area))) ||
                  ((!targetAreas || targetAreas.includes(tgt.area)) && selectedSubtopics.includes(tgt.subtopic) && (!targetAreas || !targetAreas.includes(src.area)))) &&
                  (!bridgeTargetArea || src.area === bridgeTargetArea || tgt.area === bridgeTargetArea))
              );

            // Linha com cor chapada limpa
            const strokeColor = isConnectedToSelected || isConnectedToHovered
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

            const strokeWidth = isBridgeConn
              ? 2.6
              : isConnectedToSelected || isConnectedToHovered
              ? 2
              : 1.2;

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
                {/* Esfera em Cor Chapada */}
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
