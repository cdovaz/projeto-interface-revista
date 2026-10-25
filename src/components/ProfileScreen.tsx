import React, { useState } from 'react';
import {
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  GraduationCap,
  Globe,
  Code2,
  FileText,
  Clock,
  Sparkles,
  GitBranch,
  Activity,
  Layers,
  FolderArchive,
  Link2,
  ChevronDown,
  ChevronUp,
  Compass,
  Calendar,
  Flame,
  Quote
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

interface HistoryItem {
  id: string;
  entryNumber: string;
  callNumber: string;
  timestamp: string;
  date: string;
  timeSpent: string;
  primaryArea: ScientificArea;
  secondaryArea?: ScientificArea;
  title: string;
  author: string;
  targetNodeId: string;
  quote: string;
  keyConcepts: string[];
  sessionGroup: {
    sessionId: string;
    sessionTitle: string;
    sessionDate: string;
    totalTime: string;
    focus: string;
  };
  discoveryLink?: {
    fromTitle: string;
    fromArea: ScientificArea;
    bridgeConcept: string;
    insight: string;
  };
  gapAnalysis?: {
    bridge: string;
    unexploredArea: ScientificArea;
    suggestion: string;
  };
}

export const ProfileScreen: React.FC = () => {
  const { nodes, setSelectedNodeId, setActiveAreaFilter } = useContentStore();
  const { focusOnCoordinates, setActiveScreen } = useMapStore();

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Controle das 6 Variações do Histórico Recente
  const [selectedVariation, setSelectedVariation] = useState<
    'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6'
  >('v1');
  const [filterArea, setFilterArea] = useState<ScientificArea | 'Todas'>('Todas');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // 1. Proporção de Áreas Mais Lidas (Barra Segmentada Contínua)
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

  // 2. 3 Leituras Recomendadas (Cards Prism 2+4 Limpos em 3 Colunas)
  const recommendedNodeIds = ['comp-5', 'bio-1', 'mat-1'];
  const recommendedPapers = recommendedNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean) as typeof nodes;

  // Base Completa do Histórico Recente (6 Entradas Ricas)
  const historyEntries: HistoryItem[] = [
    {
      id: 'h1',
      entryNumber: 'REG. #042',
      callNumber: 'QA76.87 .P72 2026',
      timestamp: 'Há 2 horas',
      date: '24 Out 2026',
      timeSpent: '16 min',
      primaryArea: 'Computação',
      secondaryArea: 'Biologia',
      title: 'Interpretabilidade Mecanística em Modelos de Linguagem',
      author: 'Dr. Lucas Prado',
      targetNodeId: 'comp-5',
      quote:
        'Circuitos neurais internos não operam como caixas-pretas estáticas; neurônios polissêmicos decompõem conceitos em superposições esparsas.',
      keyConcepts: ['Mecanística', 'Superposição', 'Autoencoders Esparsos', 'Circuitos'],
      sessionGroup: {
        sessionId: 's1',
        sessionTitle: 'Sessão 08 • Foco em IA & Neuroarquitetura',
        sessionDate: 'Hoje, 14:30',
        totalTime: '38 min',
        focus: 'Computação & Biologia'
      },
      discoveryLink: {
        fromTitle: 'Plasticidade Sináptica em Redes Biológicas',
        fromArea: 'Biologia',
        bridgeConcept: 'Poda Neural & Sparsity',
        insight:
          'O mecanismo de atenção esparsa espelha o refinamento homeostático de sinapses corticais durante a consolidação da memória.'
      },
      gapAnalysis: {
        bridge: 'Computação ↔ Biologia',
        unexploredArea: 'Física',
        suggestion:
          'Cruzar com Termodinâmica de Não-Equilíbrio para fundamentar o gasto energético do circuito de atenção esparsa.'
      }
    },
    {
      id: 'h2',
      entryNumber: 'REG. #041',
      callNumber: 'QH505 .M45 2026',
      timestamp: 'Ontem',
      date: '23 Out 2026',
      timeSpent: '22 min',
      primaryArea: 'Biologia',
      secondaryArea: 'Física',
      title: 'Plasticidade Sináptica e Aprendizado Hebbiano em Redes Biológicas',
      author: 'Dra. Beatriz Mendes',
      targetNodeId: 'bio-1',
      quote:
        'Redes biológicas regulam ativamente sua excitabilidade para evitar saturação, mantendo o sistema em um regime crítico de máxima capacidade computacional.',
      keyConcepts: ['Plasticidade Homeostática', 'Potenciação LTP', 'Criticalidade', 'Donald Hebb'],
      sessionGroup: {
        sessionId: 's1',
        sessionTitle: 'Sessão 08 • Foco em IA & Neuroarquitetura',
        sessionDate: 'Hoje, 14:30',
        totalTime: '38 min',
        focus: 'Computação & Biologia'
      },
      discoveryLink: {
        fromTitle: 'Topologia Algébrica de Dados',
        fromArea: 'Matemática',
        bridgeConcept: 'Complexos Simpliciais Neurais',
        insight:
          'Cavidades topológicas em matrizes de conectividade sináptica prevêem matematicamente a persistência temporal de memórias de curto prazo.'
      },
      gapAnalysis: {
        bridge: 'Biologia ↔ Física',
        unexploredArea: 'Computação',
        suggestion:
          'Explorar Modelos de Difusão em Espaços Contínuos para simular a dispersão estocástica de neurotransmissores.'
      }
    },
    {
      id: 'h3',
      entryNumber: 'REG. #040',
      callNumber: 'QA611 .R63 2026',
      timestamp: 'Há 2 dias',
      date: '22 Out 2026',
      timeSpent: '28 min',
      primaryArea: 'Matemática',
      secondaryArea: 'Computação',
      title: 'Topologia Algébrica de Dados em Espaços de Alta Dimensão',
      author: 'Prof. Carlos Rocha',
      targetNodeId: 'mat-1',
      quote:
        'A homologia persistente transforma o ruído de amostras esparsas em invariantes geométricos que descrevem a verdadeira forma topológica do manifold.',
      keyConcepts: ['Homologia Persistente', 'Diagramas de Barcode', 'Complexos Vietoris-Rips', 'Manifolds'],
      sessionGroup: {
        sessionId: 's2',
        sessionTitle: 'Sessão 07 • Geometria da Informação & Alta Dimensão',
        sessionDate: '22 Out, 20:15',
        totalTime: '45 min',
        focus: 'Matemática & Computação'
      },
      discoveryLink: {
        fromTitle: 'Geometria do Espaço Latente em Difusão',
        fromArea: 'Computação',
        bridgeConcept: 'Curvatura de Ricci',
        insight:
          'A contração do espaço latente durante o desruído coincide com o desaparecimento sucessivo de classes de homologia de ordem superior.'
      },
      gapAnalysis: {
        bridge: 'Matemática ↔ Computação',
        unexploredArea: 'Humanidades',
        suggestion:
          'Investigar Epistemologia dos Grafos para analisar criticamente se invariantes topológicos realmente capturam significados semânticos.'
      }
    },
    {
      id: 'h4',
      entryNumber: 'REG. #039',
      callNumber: 'QC318 .S56 2026',
      timestamp: 'Há 4 dias',
      date: '20 Out 2026',
      timeSpent: '19 min',
      primaryArea: 'Física',
      secondaryArea: 'Biologia',
      title: 'Termodinâmica de Não-Equilíbrio e Teoria da Informação',
      author: 'Dr. Henrique Silva',
      targetNodeId: 'fis-1',
      quote:
        'O custo entrópico do apagamento de bits estabelece a ponte física irreversível entre termodinâmica estatística e processamento biológico de sinais.',
      keyConcepts: ['Princípio de Landauer', 'Entropia de Shannon', 'Produção de Entropia', 'Sistemas Abertos'],
      sessionGroup: {
        sessionId: 's3',
        sessionTitle: 'Sessão 06 • Sistemas Abertos, Entropia & Informação',
        sessionDate: '20 Out, 11:00',
        totalTime: '19 min',
        focus: 'Física Pura'
      },
      discoveryLink: {
        fromTitle: 'Auto-Organização em Redes Metabólicas',
        fromArea: 'Biologia',
        bridgeConcept: 'Teorema de Flutuação',
        insight:
          'Ciclos bioquímicos em vias metabólicas operam no limite exato de dissipação mínima de calor previsto por relações de Jarzynski.'
      },
      gapAnalysis: {
        bridge: 'Física ↔ Biologia',
        unexploredArea: 'Química',
        suggestion:
          'Conectar com Catálise Supramolecular para verificar como nanogaiolas artificiais diminuem a produção local de entropia.'
      }
    },
    {
      id: 'h5',
      entryNumber: 'REG. #038',
      callNumber: 'BD161 .R18 2026',
      timestamp: 'Há 6 dias',
      date: '18 Out 2026',
      timeSpent: '25 min',
      primaryArea: 'Humanidades',
      secondaryArea: 'Computação',
      title: 'A Estrutura das Revoluções Científicas na Era da IA Generativa',
      author: 'Dra. Elena Ramos',
      targetNodeId: 'hum-1',
      quote:
        'Quando modelos fundacionais começam a propor hipóteses científicas autônomas, a mudança de paradigma deixa de ser um fenômeno sociológico puramente humano.',
      keyConcepts: ['Paradigmas de Kuhn', 'Epistemologia Computacional', 'Autonomia Científica', 'Filosofia'],
      sessionGroup: {
        sessionId: 's4',
        sessionTitle: 'Sessão 05 • Filosofia & Sociologia da Ciência',
        sessionDate: '18 Out, 16:40',
        totalTime: '25 min',
        focus: 'Humanidades'
      },
      discoveryLink: {
        fromTitle: 'Redes Neurais em Grafos para Descoberta Molecular',
        fromArea: 'Computação',
        bridgeConcept: 'Falseabilidade Algorítmica',
        insight:
          'O screening algorítmico automatizado altera estruturalmente o critério popperiano de falseabilidade experimental.'
      },
      gapAnalysis: {
        bridge: 'Humanidades ↔ Computação',
        unexploredArea: 'Matemática',
        suggestion:
          'Examinar Teoria da Decisão sob Incerteza Estrutural para fundamentar como cientistas humanos validam axiomas sugeridos por IAs.'
      }
    },
    {
      id: 'h6',
      entryNumber: 'REG. #037',
      callNumber: 'QD505 .F21 2026',
      timestamp: 'Há 1 semana',
      date: '16 Out 2026',
      timeSpent: '15 min',
      primaryArea: 'Química',
      secondaryArea: 'Computação',
      title: 'Catálise Supramolecular e Grafos de Reação',
      author: 'Dr. Arthur Faria',
      targetNodeId: 'qui-1',
      quote:
        'Cargas eletrostáticas confinadas em nanogaiolas moleculares dobram a superfície de energia livre, viabilizando rotas cinéticas outrora consideradas proibidas.',
      keyConcepts: ['Nanogaiolas', 'Cinética Supramolecular', 'Superfície de Energia', 'Quimioinformática'],
      sessionGroup: {
        sessionId: 's5',
        sessionTitle: 'Sessão 04 • Catálise Molecular & Novos Materiais',
        sessionDate: '16 Out, 09:20',
        totalTime: '15 min',
        focus: 'Química & Materiais'
      },
      discoveryLink: {
        fromTitle: 'GNNs para Descoberta Molecular',
        fromArea: 'Computação',
        bridgeConcept: 'Isomorfismo de Grafos',
        insight:
          'A representação equivariante de grupos de simetria química acelera em mil vezes a predição computacional de estados de transição.'
      },
      gapAnalysis: {
        bridge: 'Química ↔ Computação',
        unexploredArea: 'Biologia',
        suggestion:
          'Cruzar com Dobramento Proteico para simular bolsas catalíticas artificiais compatíveis com enzimas vivas.'
      }
    }
  ];

  const filteredEntries =
    filterArea === 'Todas'
      ? historyEntries
      : historyEntries.filter(
          (item) => item.primaryArea === filterArea || item.secondaryArea === filterArea
        );

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

  // Metadados das 6 Variações
  const variationOptions: {
    id: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';
    label: string;
    subtitle: string;
    description: string;
  }[] = [
    {
      id: 'v1',
      label: '1. Caderno de Campo',
      subtitle: 'Fichamento Perfurado & Carimbo',
      description:
        'Páginas destacáveis de fichário com borda picotada, carimbo de registro oficial, citação serifada em destaque, scroll interno e filtro fixo.'
    },
    {
      id: 'v2',
      label: '2. Fichário Catalográfico',
      subtitle: 'Library Index Cards (2 Colunas)',
      description:
        'Grade inspirada nas antigas fichas de biblioteca: código de chamada Dewey, furo circular mecânico, barra de classificação colorida e excerto.'
    },
    {
      id: 'v3',
      label: '3. Linhagem de Descoberta',
      subtitle: 'Árvore Genealógica de Ideias',
      description:
        'Linha do tempo conectiva revelando o raciocínio encadeado: qual artigo levou a qual leitura através de conceitos-ponte transdisciplinares.'
    },
    {
      id: 'v4',
      label: '4. Radar de Sessões',
      subtitle: 'Blocos de Imersão & Deep Work',
      description:
        'Histórico organizado por episódios de estudo concentrado, exibindo tempo total de foco, intensidade temática e lista expansível.'
    },
    {
      id: 'v5',
      label: '5. Deck Suíço',
      subtitle: 'Minimalismo Editorial com Grandes Índices',
      description:
        'Estética modernista suíça de alta precisão: grandes números tipográficos, divisórias finas e gaveta expansível para citação e conceitos.'
    },
    {
      id: 'v6',
      label: '6. Matriz de Pontes',
      subtitle: 'Fronteiras & Lacunas Não-Exploradas',
      description:
        'Visão analítica de interseção entre áreas que você explorou, sugerindo ativamente quais lacunas faltam ler para fechar o ciclo no grafo.'
    }
  ];

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

            <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-200 dark:bg-white/10 p-[1px] gap-[2px]">
              {readingProportions.map((item) => {
                const theme = SCIENTIFIC_AREAS[item.area];
                return (
                  <div
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    title={`${item.area}: ${item.percent}% (${item.articlesRead} leituras)`}
                    className="h-full first:rounded-l-full last:rounded-r-full cursor-pointer hover:opacity-90 transition-transform hover:scale-y-110"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: theme.accentColor
                    }}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              {readingProportions.map((item) => {
                const theme = SCIENTIFIC_AREAS[item.area];
                return (
                  <button
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    className="group flex items-center gap-1.5 text-xs font-mono hover:opacity-80 transition-opacity"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="text-stone-600 dark:text-stone-300 font-medium">
                      {item.area}
                    </span>
                    <span className="text-stone-400 font-bold">{item.percent}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 2. 3 LEITURAS RECOMENDADAS ================= */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="font-editorial text-xl font-bold">3 Leituras Recomendadas</h2>
            </div>
            <span className="font-mono text-[10px] text-stone-400">
              Baseadas no seu interesse transdisciplinar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedPapers.map((node) => {
              const areaTheme = SCIENTIFIC_AREAS[node.area];
              const isHovered = hoveredCardId === `rec-${node.id}`;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredCardId(`rec-${node.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => handleOpenNode(node.id)}
                  className="relative group cursor-pointer"
                >
                  <div
                    className="absolute inset-0 rounded-2xl transition-opacity duration-200 pointer-events-none"
                    style={{
                      backgroundColor: areaTheme.accentColor,
                      opacity: isHovered ? 0.08 : 0
                    }}
                  />

                  <div
                    className="relative h-full p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between"
                    style={{
                      borderColor: isHovered ? areaTheme.accentColor : 'rgba(148, 163, 184, 0.16)',
                      boxShadow: isHovered
                        ? `0 0 0 1px ${areaTheme.accentColor}, 0 8px 20px -8px ${areaTheme.glowColor}`
                        : 'none',
                      backgroundColor: isHovered
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(255, 255, 255, 0.4)'
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

        {/* ================= 3. SELETOR DE 6 VARIAÇÕES DO HISTÓRICO RECENTE ================= */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 space-y-6 shadow-xl">
          {/* Cabeçalho Superior com Barra de Variações */}
          <div className="space-y-4 border-b border-stone-200/80 dark:border-white/10 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center font-mono font-bold text-xs shadow-sm">
                  {selectedVariation.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    Histórico Recente
                    <span className="text-xs font-mono font-normal text-stone-400">
                      (6 Variações)
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    {variationOptions.find((v) => v.id === selectedVariation)?.subtitle} —{' '}
                    <span className="italic">
                      {variationOptions.find((v) => v.id === selectedVariation)?.description}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Seletor em Pílulas das 6 Variações */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {variationOptions.map((v) => {
                const isActive = selectedVariation === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v.id)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md scale-[1.02]'
                        : 'bg-stone-100 dark:bg-white/[0.05] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-white/[0.1] border border-stone-200/60 dark:border-white/5'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* Filtro Rápido por Área Científica */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] font-mono">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] mr-1 shrink-0">
                Filtrar:
              </span>
              <button
                onClick={() => setFilterArea('Todas')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  filterArea === 'Todas'
                    ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 font-bold'
                    : 'bg-stone-100 dark:bg-white/[0.04] text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Todas ({historyEntries.length})
              </button>
              {(
                ['Computação', 'Biologia', 'Matemática', 'Física', 'Humanidades', 'Química'] as ScientificArea[]
              ).map((area) => {
                const theme = SCIENTIFIC_AREAS[area];
                const isSelected = filterArea === area;
                const count = historyEntries.filter(
                  (item) => item.primaryArea === area || item.secondaryArea === area
                ).length;

                return (
                  <button
                    key={area}
                    onClick={() => setFilterArea(area)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? theme.accentColor : undefined,
                      color: isSelected ? '#FFFFFF' : undefined
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : theme.accentColor }}
                    />
                    <span className={isSelected ? 'font-bold' : 'text-stone-600 dark:text-stone-400'}>
                      {area}
                    </span>
                    <span
                      className="text-[9px] font-mono opacity-70"
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VARIAÇÃO 1: CADERNO DE CAMPO (Fichamento Perfurado & Carimbo Oficial)     */}
          {/* ========================================================================= */}
          {selectedVariation === 'v1' && (
            <div className="space-y-4">
              <div className="max-h-[560px] overflow-y-auto pr-2 space-y-4">
                {filteredEntries.map((item) => {
                  const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
                  const secondaryTheme = item.secondaryArea
                    ? SCIENTIFIC_AREAS[item.secondaryArea]
                    : null;
                  const isHovered = hoveredCardId === `v1-${item.id}`;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredCardId(`v1-${item.id}`)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      className="relative rounded-2xl border-2 border-dashed transition-all duration-200 bg-stone-50/90 dark:bg-[#0c121e]/90 p-5 group"
                      style={{
                        borderColor: isHovered
                          ? primaryTheme.accentColor
                          : 'rgba(148, 163, 184, 0.25)',
                        boxShadow: isHovered
                          ? `0 6px 20px -8px ${primaryTheme.glowColor}`
                          : 'none'
                      }}
                    >
                      {/* Simulação de Furo Mecânico de Fichário na lateral esquerda */}
                      <div className="absolute -left-2 top-6 w-3.5 h-3.5 rounded-full bg-stone-100 dark:bg-[#070A10] border-2 border-stone-300 dark:border-white/20 shadow-inner" />

                      {/* Cabeçalho da Ficha Estilo Carimbo de Laboratório */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/60 dark:border-white/10 pb-3 mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 tracking-wider">
                            {item.entryNumber}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            • {item.date} ({item.timestamp})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: primaryTheme.accentColor }}
                          >
                            {item.primaryArea}
                          </span>
                          {secondaryTheme && (
                            <span
                              className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: secondaryTheme.accentColor }}
                            >
                              ↔ {item.secondaryArea}
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenNode(item.targetNodeId)}
                            className="flex items-center gap-1 font-mono text-[10px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer ml-1"
                          >
                            <span>Saltar no Grafo</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Título & Autor */}
                      <div className="space-y-1 mb-3">
                        <h3
                          onClick={() => handleOpenNode(item.targetNodeId)}
                          className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer transition-colors"
                          style={isHovered ? { color: primaryTheme.accentColor } : undefined}
                        >
                          {item.title}
                        </h3>
                        <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                          {item.author} • Tempo de estudo: {item.timeSpent}
                        </p>
                      </div>

                      {/* Citação em Destaque Serifada com Aspas Elegantes */}
                      <div className="relative pl-4 py-2 my-2 border-l-2 border-stone-300 dark:border-white/20 bg-stone-100/60 dark:bg-white/[0.02] rounded-r-xl">
                        <Quote className="w-3.5 h-3.5 text-stone-400 mb-1 opacity-70" />
                        <p className="font-editorial text-sm italic text-stone-700 dark:text-stone-300 leading-relaxed">
                          "{item.quote}"
                        </p>
                      </div>

                      {/* Conceitos-Chave Taggeados */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mr-1">
                          Conceitos:
                        </span>
                        {item.keyConcepts.map((concept) => (
                          <span
                            key={concept}
                            className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-white/5 text-stone-700 dark:text-stone-300 border border-stone-300/40 dark:border-white/5"
                          >
                            #{concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VARIAÇÃO 2: FICHÁRIO CATALOGRÁFICO (Library Index Cards em Grade 2 Colunas)*/}
          {/* ========================================================================= */}
          {selectedVariation === 'v2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((item) => {
                const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
                const isHovered = hoveredCardId === `v2-${item.id}`;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCardId(`v2-${item.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => handleOpenNode(item.targetNodeId)}
                    className="relative rounded-2xl border bg-stone-50 dark:bg-[#0E131F] p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group"
                    style={{
                      borderColor: isHovered
                        ? primaryTheme.accentColor
                        : 'rgba(148, 163, 184, 0.2)',
                      boxShadow: isHovered
                        ? `0 8px 24px -10px ${primaryTheme.glowColor}`
                        : 'none'
                    }}
                  >
                    {/* Tarja Superior na cor sólida da área */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                      style={{ backgroundColor: primaryTheme.accentColor }}
                    />

                    <div>
                      {/* Cabeçalho da Ficha de Biblioteca */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/10 mb-3">
                        <div className="flex items-center gap-2">
                          <FolderArchive className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-mono text-[11px] font-bold text-stone-600 dark:text-stone-300 tracking-wider">
                            {item.callNumber}
                          </span>
                        </div>
                        {/* Furo mecânico típico de fichário de catálogo */}
                        <div className="w-2.5 h-2.5 rounded-full border border-stone-400 bg-stone-200 dark:bg-stone-700" />
                      </div>

                      <div className="space-y-1 mb-2.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                          ARQUIVADO: {item.date} ({item.timestamp})
                        </span>
                        <h3
                          className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:underline line-clamp-2"
                          style={isHovered ? { color: primaryTheme.accentColor } : undefined}
                        >
                          {item.title}
                        </h3>
                        <p className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                          Autor: {item.author}
                        </p>
                      </div>

                      <p className="font-editorial text-xs italic text-stone-600 dark:text-stone-300 line-clamp-2 border-l border-stone-300 dark:border-white/15 pl-2.5 my-2">
                        "{item.quote}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-white/10 mt-2">
                      <span
                        className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: primaryTheme.accentColor }}
                      >
                        {item.primaryArea}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400 flex items-center gap-1 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                        Ver no Grafo <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VARIAÇÃO 3: LINHAGEM DE DESCOBERTA (Árvore Genealógica de Ideias)         */}
          {/* ========================================================================= */}
          {selectedVariation === 'v3' && (
            <div className="relative pl-6 space-y-6">
              {/* Linha vertical contínua da linhagem */}
              <div className="absolute left-3 top-3 bottom-3 w-[2px] bg-stone-300 dark:bg-white/15 border-dashed" />

              {filteredEntries.map((item) => {
                const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
                const fromTheme = item.discoveryLink
                  ? SCIENTIFIC_AREAS[item.discoveryLink.fromArea]
                  : null;
                const isHovered = hoveredCardId === `v3-${item.id}`;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCardId(`v3-${item.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="relative rounded-2xl border bg-stone-50/90 dark:bg-[#0c121e]/90 p-5 transition-all duration-200 group"
                    style={{
                      borderColor: isHovered
                        ? primaryTheme.accentColor
                        : 'rgba(148, 163, 184, 0.2)',
                      boxShadow: isHovered
                        ? `0 6px 20px -8px ${primaryTheme.glowColor}`
                        : 'none'
                    }}
                  >
                    {/* Ponto indicador do salto sobre a linha */}
                    <div
                      className="absolute -left-[27px] top-6 w-5 h-5 rounded-full border-2 border-white dark:border-[#070A10] flex items-center justify-center shadow"
                      style={{ backgroundColor: primaryTheme.accentColor }}
                    >
                      <GitBranch className="w-2.5 h-2.5 text-white" />
                    </div>

                    {/* Banner do Elo Conector (De Onde Saiu -> Para Onde Foi) */}
                    {item.discoveryLink && fromTheme && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 mb-3 text-xs">
                        <span
                          className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: fromTheme.accentColor }}
                        >
                          {fromTheme.name}
                        </span>
                        <span className="font-mono text-stone-400">➔</span>
                        <span className="font-mono text-[10px] font-bold text-stone-600 dark:text-stone-300 truncate">
                          Elo: {item.discoveryLink.bridgeConcept}
                        </span>
                        <span className="font-mono text-stone-400">➔</span>
                        <span
                          className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: primaryTheme.accentColor }}
                        >
                          {primaryTheme.name}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">
                          {item.timestamp} • {item.date}
                        </span>
                        <button
                          onClick={() => handleOpenNode(item.targetNodeId)}
                          className="font-mono text-[10px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          Localizar Nó <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                      <h3
                        onClick={() => handleOpenNode(item.targetNodeId)}
                        className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                        style={isHovered ? { color: primaryTheme.accentColor } : undefined}
                      >
                        {item.title}
                      </h3>
                      <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                        {item.author}
                      </p>
                    </div>

                    {item.discoveryLink && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed pt-1">
                        <strong className="font-mono text-[11px] text-stone-400">Raciocínio: </strong>
                        {item.discoveryLink.insight}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VARIAÇÃO 4: RADAR DE SESSÕES & IMERSÃO (Blocos de Deep Work)             */}
          {/* ========================================================================= */}
          {selectedVariation === 'v4' && (
            <div className="space-y-4">
              {/* Agrupa as entradas pelas sessões de estudo */}
              {Array.from(
                new Set(filteredEntries.map((item) => item.sessionGroup.sessionId))
              ).map((sessionId) => {
                const sessionItems = filteredEntries.filter(
                  (i) => i.sessionGroup.sessionId === sessionId
                );
                const first = sessionItems[0];
                if (!first) return null;
                const isExpanded = expandedEntryId === sessionId;

                return (
                  <div
                    key={sessionId}
                    className="rounded-2xl border border-stone-200/80 dark:border-white/10 bg-stone-50/80 dark:bg-[#0c121e]/80 overflow-hidden transition-all shadow-sm"
                  >
                    {/* Cabeçalho da Sessão */}
                    <div
                      onClick={() =>
                        setExpandedEntryId(isExpanded ? null : sessionId)
                      }
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100">
                              {first.sessionGroup.sessionTitle}
                            </h3>
                            <span className="font-mono text-[10px] text-stone-400">
                              • {first.sessionGroup.sessionDate}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                            Foco: {first.sessionGroup.focus} • {sessionItems.length} leituras
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                          {first.sessionGroup.totalTime}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Lista das leituras da sessão */}
                    <div className="p-4 pt-1 border-t border-stone-200/60 dark:border-white/10 space-y-3">
                      {sessionItems.map((item) => {
                        const theme = SCIENTIFIC_AREAS[item.primaryArea];
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenNode(item.targetNodeId)}
                            className="p-3 rounded-xl bg-white dark:bg-[#0E131F] border border-stone-200/60 dark:border-white/5 flex items-center justify-between gap-4 hover:border-stone-400 dark:hover:border-white/20 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: theme.accentColor }}
                              />
                              <span
                                className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white shrink-0"
                                style={{ backgroundColor: theme.accentColor }}
                              >
                                {item.primaryArea}
                              </span>
                              <span className="font-editorial text-sm text-stone-800 dark:text-stone-200 truncate">
                                {item.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-stone-400">
                              <span>{item.timeSpent}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VARIAÇÃO 5: DECK MINIMALISTA SUÍÇO (Grandes Índices & Strip Cards)       */}
          {/* ========================================================================= */}
          {selectedVariation === 'v5' && (
            <div className="divide-y divide-stone-200 dark:divide-white/10">
              {filteredEntries.map((item, index) => {
                const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
                const isHovered = hoveredCardId === `v5-${item.id}`;
                const isExpanded = expandedEntryId === `v5-${item.id}`;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCardId(`v5-${item.id}`)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="py-4 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Grande número de índice suíço */}
                        <span className="font-mono text-2xl font-bold text-stone-300 dark:text-stone-700 w-8 shrink-0">
                          0{index + 1}
                        </span>

                        {/* Barra lateral sólida */}
                        <div
                          className="w-1 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: primaryTheme.accentColor }}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded text-white"
                              style={{ backgroundColor: primaryTheme.accentColor }}
                            >
                              {item.primaryArea}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">
                              {item.timestamp} • {item.author}
                            </span>
                          </div>
                          <h3
                            onClick={() => handleOpenNode(item.targetNodeId)}
                            className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer truncate"
                          >
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setExpandedEntryId(isExpanded ? null : `v5-${item.id}`)
                          }
                          className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.05] hover:bg-stone-200 dark:hover:bg-white/[0.1] text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Recolher' : 'Citação'}
                        </button>
                        <button
                          onClick={() => handleOpenNode(item.targetNodeId)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/[0.05] hover:bg-stone-200 dark:hover:bg-white/[0.1] text-stone-600 dark:text-stone-300 cursor-pointer"
                          title="Abrir no Grafo"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Gaveta Expansível com Citação e Conceitos */}
                    {isExpanded && (
                      <div className="ml-14 mt-3 p-3.5 rounded-xl bg-stone-50 dark:bg-[#0c121e] border border-stone-200/80 dark:border-white/10 space-y-2">
                        <p className="font-editorial text-xs italic text-stone-700 dark:text-stone-300">
                          "{item.quote}"
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {item.keyConcepts.map((c) => (
                            <span
                              key={c}
                              className="font-mono text-[9px] px-2 py-0.5 rounded bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-stone-400"
                            >
                              #{c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VARIAÇÃO 6: MATRIZ DE PONTES & FRONTEIRAS (Crossroads & Gaps)             */}
          {/* ========================================================================= */}
          {selectedVariation === 'v6' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-mono">
                <span>⚡ Oportunidades de conexões transdisciplinares identificadas no seu histórico</span>
                <span className="font-bold">{filteredEntries.length} pontes ativas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEntries.map((item) => {
                  const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
                  const secondaryTheme = item.secondaryArea
                    ? SCIENTIFIC_AREAS[item.secondaryArea]
                    : null;
                  const unexploredTheme = item.gapAnalysis
                    ? SCIENTIFIC_AREAS[item.gapAnalysis.unexploredArea]
                    : null;
                  const isHovered = hoveredCardId === `v6-${item.id}`;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredCardId(`v6-${item.id}`)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      className="rounded-2xl border bg-stone-50/90 dark:bg-[#0c121e]/90 p-5 space-y-3 transition-all duration-200"
                      style={{
                        borderColor: isHovered
                          ? primaryTheme.accentColor
                          : 'rgba(148, 163, 184, 0.2)',
                        boxShadow: isHovered
                          ? `0 6px 20px -8px ${primaryTheme.glowColor}`
                          : 'none'
                      }}
                    >
                      {/* Duplo Badge de Ponte Transdisciplinar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: primaryTheme.accentColor }}
                          >
                            {item.primaryArea}
                          </span>
                          <span className="font-mono text-xs text-stone-400">↔</span>
                          {secondaryTheme && (
                            <span
                              className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: secondaryTheme.accentColor }}
                            >
                              {secondaryTheme.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenNode(item.targetNodeId)}
                          className="font-mono text-[10px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          Ver no Grafo <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                      <h3
                        onClick={() => handleOpenNode(item.targetNodeId)}
                        className="font-editorial text-sm font-bold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                      >
                        {item.title}
                      </h3>

                      {/* Caixa de Sugestão de Fechamento de Ciclo / Lacuna */}
                      {item.gapAnalysis && unexploredTheme && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#0E131F] border border-stone-200/80 dark:border-white/10 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400 uppercase font-bold">
                            <Compass className="w-3 h-3 text-stone-400" />
                            <span>Lacuna Sugerida para Cruzar:</span>
                            <span
                              className="px-1.5 py-0.2 rounded text-white text-[9px]"
                              style={{ backgroundColor: unexploredTheme.accentColor }}
                            >
                              {unexploredTheme.name}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
                            {item.gapAnalysis.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
