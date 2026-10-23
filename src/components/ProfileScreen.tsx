import React, { useState } from 'react';
import {
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Clock,
  BookmarkCheck,
  GraduationCap,
  Globe,
  Code2,
  FileText
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

export const ProfileScreen: React.FC = () => {
  const { nodes, setSelectedNodeId, setActiveAreaFilter } = useContentStore();
  const { focusOnCoordinates, setActiveScreen } = useMapStore();

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // 1. Proporção de Áreas Mais Lidas (Barra Segmentada Contínua — V1)
  const readingProportions: {
    area: ScientificArea;
    percent: number;
    articlesRead: number;
  }[] = [
    { area: 'Computação', percent: 38, articlesRead: 42 },
    { area: 'Biologia', percent: 27, articlesRead: 30 },
    { area: 'Matemática', percent: 19, articlesRead: 21 },
    { area: 'Humanidades', percent: 10, articlesRead: 11 },
    { area: 'Física', percent: 6, articlesRead: 7 }
  ];

  // 2. 3 Leituras Recomendadas (Cards Prism 2+4 Limpos em 3 Colunas — V1)
  const recommendedNodeIds = ['comp-5', 'bio-1', 'mat-1'];
  const recommendedPapers = recommendedNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean) as typeof nodes;

  // 3. Histórico Recente (V4 + Camadas 3D Prism no Hover — V2)
  const recentHistory: {
    id: string;
    type: 'read' | 'connection';
    timeAgo: string;
    primaryArea: ScientificArea;
    secondaryArea?: ScientificArea;
    title: string;
    targetNodeId: string;
  }[] = [
    {
      id: 'h1',
      type: 'connection',
      timeAgo: 'Há 2 horas',
      primaryArea: 'Computação',
      secondaryArea: 'Biologia',
      title: 'Conectou "Interpretabilidade Mecanística em LLMs" com "Plasticidade Sináptica e Poda Neural"',
      targetNodeId: 'comp-5'
    },
    {
      id: 'h2',
      type: 'read',
      timeAgo: 'Ontem',
      primaryArea: 'Matemática',
      title: 'Leu "Topologia Algébrica de Dados em Espaços de Alta Dimensão"',
      targetNodeId: 'mat-1'
    },
    {
      id: 'h3',
      type: 'read',
      timeAgo: 'Há 3 dias',
      primaryArea: 'Humanidades',
      title: 'Leu "A Estrutura das Revoluções Científicas na Era da IA Generativa"',
      targetNodeId: 'hum-1'
    },
    {
      id: 'h4',
      type: 'connection',
      timeAgo: 'Há 5 dias',
      primaryArea: 'Biologia',
      secondaryArea: 'Física',
      title: 'Conectou "Auto-Organização em Redes Metabólicas" com "Termodinâmica de Não-Equilíbrio"',
      targetNodeId: 'bio-2'
    },
    {
      id: 'h5',
      type: 'read',
      timeAgo: 'Há 1 semana',
      primaryArea: 'Computação',
      title: 'Leu "Redes Neurais em Grafos (GNNs) para Descoberta Molecular"',
      targetNodeId: 'comp-2'
    },
    {
      id: 'h6',
      type: 'connection',
      timeAgo: 'Há 9 dias',
      primaryArea: 'Matemática',
      secondaryArea: 'Computação',
      title: 'Conectou "Geometria da Informação" com "Otimização em Variedades Riemannianas"',
      targetNodeId: 'mat-1'
    }
  ];

  const handleOpenNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedNodeId(nodeId);
    if (node && node.x !== undefined && node.y !== undefined) {
      focusOnCoordinates(node.x, node.y, 1.3);
    } else {
      setActiveScreen('navegar');
    }
  };

  const handleFilterArea = (area: ScientificArea) => {
    const theme = SCIENTIFIC_AREAS[area];
    setActiveAreaFilter(area);
    focusOnCoordinates(theme.center.x, theme.center.y, 1.1);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-stone-100 dark:bg-[#070A10] text-stone-900 dark:text-stone-100 select-none">
      <div className="max-w-4xl mx-auto px-6 py-8 lg:py-10 space-y-10">
        {/* ================= 1. PASSAPORTE DO AUTOR & PROPORÇÃO DE ÁREAS MAIS LIDAS ================= */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 p-[2px] shadow-md shrink-0"
                style={{ width: 68, height: 68 }}
              >
                <div className="w-full h-full rounded-[14px] bg-stone-950 flex items-center justify-center text-white font-editorial text-2xl font-bold tracking-tight">
                  DV
                </div>
              </div>

              <div className="space-y-1.5">
                <h1 className="font-editorial text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Daniel Ventura
                </h1>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Pesquisador em Ciência da Computação & Sistemas Complexos • USP</span>
                </div>

                <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                  <a
                    href="https://orcid.org"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] hover:bg-stone-200 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-emerald-400" /> ORCID{' '}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://scholar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] hover:bg-stone-200 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" /> Scholar{' '}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] hover:bg-stone-200 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    <Code2 className="w-3 h-3 text-cyan-400" /> GitHub{' '}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://danielventura.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] hover:bg-stone-200 dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    <Globe className="w-3 h-3 text-violet-400" /> Site{' '}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200/80 dark:border-white/10 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                Proporção de Áreas Mais Lidas
              </span>
              <span className="font-mono text-[10px] text-stone-400">111 leituras</span>
            </div>

            <div className="h-3 w-full rounded-full overflow-hidden flex gap-0.5 bg-stone-200 dark:bg-stone-900 p-0.5">
              {readingProportions.map((item) => {
                const theme = SCIENTIFIC_AREAS[item.area];
                return (
                  <div
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    title={`${item.area}: ${item.percent}%`}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-opacity hover:opacity-80 cursor-pointer"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: theme.accentColor
                    }}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-3.5 flex-wrap">
              {readingProportions.map((item) => {
                const theme = SCIENTIFIC_AREAS[item.area];
                return (
                  <button
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    className="flex items-center gap-1.5 text-xs font-mono hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: theme.accentColor,
                        boxShadow: `0 0 8px ${theme.glowColor}`
                      }}
                    />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {item.area}
                    </span>
                    <span className="text-stone-400">{item.percent}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 2. 3 LEITURAS RECOMENDADAS (PRISM 2+4 EM 3 COLUNAS) ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100">
                3 Leituras Recomendadas
              </h2>
              <p className="text-xs font-mono text-stone-400">
                Curadoria pessoal dos 3 textos essenciais no mapa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedPapers.map((node) => {
              const areaTheme = SCIENTIFIC_AREAS[node.area];
              const isHovered = hoveredCardId === `rec-${node.id}`;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredCardId(`rec-${node.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => handleOpenNode(node.id)}
                  className="relative group cursor-pointer h-full"
                >
                  {/* 3ª Camada (Mais Profunda — Prism) */}
                  <div
                    className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${areaTheme.accentColor} 0%, transparent 110%)`,
                      opacity: isHovered ? 0.45 : 0.08,
                      filter: isHovered ? 'blur(2.5px)' : 'blur(0.5px)',
                      transform: isHovered ? 'translate(8px, 8px)' : 'translate(3.5px, 3.5px)'
                    }}
                  />

                  {/* 2ª Camada (Intermediária — Prism) */}
                  <div
                    className="absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${areaTheme.accentColor} 15%, ${areaTheme.glowColor} 100%)`,
                      opacity: isHovered ? 0.9 : 0.24,
                      filter: isHovered ? 'blur(0.5px)' : 'none',
                      transform: isHovered ? 'translate(4px, 4px)' : 'translate(1.8px, 1.8px)'
                    }}
                  />

                  {/* 1ª Camada (Card Frontal Frosted Glass) */}
                  <div
                    className="relative p-4 rounded-2xl border backdrop-blur-xl bg-white/95 dark:bg-[#0E131F]/95 transition-all duration-200 flex flex-col justify-between h-full"
                    style={{
                      borderColor: isHovered
                        ? areaTheme.accentColor
                        : 'rgba(148, 163, 184, 0.16)',
                      transform: isHovered ? 'translate(-2px, -2px)' : 'none',
                      boxShadow: isHovered
                        ? `0 8px 22px -8px ${areaTheme.glowColor}`
                        : 'none'
                    }}
                  >
                    <div>
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
                          className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[9px] font-mono transition-colors duration-200"
                          style={{
                            backgroundColor: isHovered
                              ? areaTheme.accentColor
                              : `${areaTheme.accentColor}18`,
                            color: isHovered ? '#FFFFFF' : areaTheme.accentColor
                          }}
                        >
                          {node.area}
                        </span>
                      </div>

                      <h3
                        className="font-editorial text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug transition-colors duration-200"
                        style={isHovered ? { color: areaTheme.accentColor } : undefined}
                      >
                        {node.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-200/40 dark:border-white/10">
                      <span className="truncate max-w-[140px]">{node.author.name}</span>
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
        </section>

        {/* ================= 3. HISTÓRICO RECENTE (V4 + CAMADAS 3D PRISM NO HOVER) ================= */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="font-editorial text-xl font-bold">Histórico Recente</h2>
            </div>
            <span className="font-mono text-[10px] text-stone-400">
              Últimos artigos lidos e conexões criadas
            </span>
          </div>

          <div className="space-y-3">
            {recentHistory.map((item) => {
              const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
              const secondaryTheme = item.secondaryArea
                ? SCIENTIFIC_AREAS[item.secondaryArea]
                : null;
              const isHovered = hoveredCardId === `v4-hist-${item.id}`;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCardId(`v4-hist-${item.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => handleOpenNode(item.targetNodeId)}
                  className="relative group cursor-pointer"
                >
                  {/* 3ª Camada (Fundo Difuso Prism 3D no Hover) */}
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${primaryTheme.accentColor} 0%, transparent 100%)`,
                      opacity: isHovered ? 0.35 : 0,
                      filter: 'blur(2px)',
                      transform: isHovered ? 'translate(6px, 5px)' : 'translate(0, 0)'
                    }}
                  />

                  {/* 2ª Camada (Placa Intermediária Prism 3D no Hover) */}
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-200 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${primaryTheme.accentColor} 15%, ${primaryTheme.glowColor} 100%)`,
                      opacity: isHovered ? 0.85 : 0,
                      transform: isHovered ? 'translate(3px, 2.5px)' : 'translate(0, 0)'
                    }}
                  />

                  {/* 1ª Camada (Linha Principal V4 com Barra Esquerda Luminosa e Dupla Tag) */}
                  <div
                    className="relative py-3 px-3.5 rounded-xl border bg-stone-50/90 dark:bg-[#0E131F]/95 backdrop-blur-xl transition-all duration-200 flex items-center justify-between gap-4"
                    style={{
                      borderColor: isHovered
                        ? primaryTheme.accentColor
                        : 'rgba(148, 163, 184, 0.12)',
                      boxShadow: isHovered
                        ? `-4px 0 0 0 ${primaryTheme.accentColor}, 0 4px 16px -6px ${primaryTheme.glowColor}`
                        : 'none',
                      transform: isHovered ? 'translate(-1.5px, -1.5px)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: primaryTheme.accentColor,
                          boxShadow: isHovered ? `0 0 8px ${primaryTheme.accentColor}` : 'none',
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                        }}
                      />
                      <span
                        className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 transition-colors duration-200"
                        style={{
                          backgroundColor: isHovered
                            ? primaryTheme.accentColor
                            : `${primaryTheme.accentColor}18`,
                          color: isHovered ? '#FFFFFF' : primaryTheme.accentColor
                        }}
                      >
                        {item.primaryArea}
                      </span>

                      {secondaryTheme && item.secondaryArea && (
                        <>
                          <span className="font-mono text-[10px] text-stone-400 shrink-0">↔</span>
                          <span
                            className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 transition-colors duration-200"
                            style={{
                              backgroundColor: `${secondaryTheme.accentColor}18`,
                              color: secondaryTheme.accentColor
                            }}
                          >
                            {item.secondaryArea}
                          </span>
                        </>
                      )}

                      <span
                        className="font-editorial text-sm text-stone-800 dark:text-stone-200 truncate transition-colors duration-200"
                        style={isHovered ? { color: primaryTheme.accentColor } : undefined}
                      >
                        {item.title}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-stone-400 shrink-0 flex items-center gap-1">
                      {item.timeAgo}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
