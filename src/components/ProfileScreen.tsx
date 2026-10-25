import React, { useState } from 'react';
import {
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  BookmarkCheck,
  GraduationCap,
  Globe,
  Code2,
  FileText,
  GitBranch,
  Terminal,
  Building2,
  BarChart3,
  Sparkles,
  Award
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea } from '../types';

interface HistoryItem {
  id: string;
  timestamp: string;
  date: string;
  primaryArea: ScientificArea;
  secondaryArea?: ScientificArea;
  title: string;
  author: string;
  targetNodeId: string;
  quote: string;
  keyConcepts: string[];
  discoveryLink: {
    fromTitle: string;
    fromArea: ScientificArea;
    bridgeConcept: string;
    insight: string;
  };
}

export const ProfileScreen: React.FC = () => {
  const { nodes, setSelectedNodeId, setActiveAreaFilter } = useContentStore();
  const { focusOnCoordinates, setActiveScreen } = useMapStore();

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState<ScientificArea | 'Todas'>('Todas');

  // Controle das 6 Variações da Seção do Autor (Nome e Cargo)
  const [selectedProfileVariation, setSelectedProfileVariation] = useState<
    'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
  >('p1');

  // Metadados das 6 Variações do Perfil do Autor
  const profileVariationOptions = [
    {
      id: 'p1' as const,
      label: '1. Suíço Modernista',
      subtitle: 'Assimetria Editorial & Tipografia Pura',
      description:
        'Layout geométrico com monograma sóbrio, badge institucional sólido e proporções de leitura com régua contínua.'
    },
    {
      id: 'p2' as const,
      label: '2. Crachá de Congresso',
      subtitle: 'Academic ID & Credencial Técnica',
      description:
        'Tarja superior de conferência científica, selo de pesquisador ativo, código ORCID como carimbo e badges de especialidades.'
    },
    {
      id: 'p3' as const,
      label: '3. Ficha Masthead',
      subtitle: 'Perfil Editorial de Revista Científica',
      description:
        'Apresentação biográfica em fluxo corrido, citação-lema de pesquisa em itálico e links integrados em linha.'
    },
    {
      id: 'p4' as const,
      label: '4. Terminal Sys-Lab',
      subtitle: 'Estação de Trabalho Unix & Laboratório',
      description:
        'Header tipo prompt de comando, variáveis de ambiente (NAME, ROLE, LAB, ORCID) e comandos interativos de sistema.'
    },
    {
      id: 'p5' as const,
      label: '5. Dossier Métricas',
      subtitle: 'Grade Analítica com KPIs de Pesquisa',
      description:
        'Cards de métricas em 3 colunas (111 leituras, 6 disciplinas, 38% foco principal) com visão de produtividade.'
    },
    {
      id: 'p6' as const,
      label: '6. Monolito Contemporâneo',
      subtitle: 'Card de Visita Duplo & Divisão Harmônica',
      description:
        'Divisão equilibrada em duas colunas: identidade do autor à esquerda e matriz de distribuição de leituras à direita.'
    }
  ];

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

  // 2. 3 Leituras Recomendadas (Cards Prism 2+4 Limpos em 3 Colunas — V1)
  const recommendedNodeIds = ['comp-5', 'bio-1', 'mat-1'];
  const recommendedPapers = recommendedNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean) as typeof nodes;

  // Base do Histórico Recente: Linhagem de Descoberta (Árvore Genealógica de Ideias)
  const historyEntries: HistoryItem[] = [
    {
      id: 'h1',
      timestamp: 'Há 2 horas',
      date: '24 Out 2026',
      primaryArea: 'Computação',
      secondaryArea: 'Biologia',
      title: 'Interpretabilidade Mecanística em Modelos de Linguagem',
      author: 'Dr. Lucas Prado',
      targetNodeId: 'comp-5',
      quote:
        'Circuitos neurais internos não operam como caixas-pretas estáticas; neurônios polissêmicos decompõem conceitos em superposições esparsas.',
      keyConcepts: ['Mecanística', 'Superposição', 'Autoencoders Esparsos', 'Circuitos'],
      discoveryLink: {
        fromTitle: 'Plasticidade Sináptica em Redes Biológicas',
        fromArea: 'Biologia',
        bridgeConcept: 'Poda Neural & Sparsity',
        insight:
          'O mecanismo de atenção esparsa espelha o refinamento homeostático de sinapses corticais durante a consolidação da memória.'
      }
    },
    {
      id: 'h2',
      timestamp: 'Ontem',
      date: '23 Out 2026',
      primaryArea: 'Biologia',
      secondaryArea: 'Física',
      title: 'Plasticidade Sináptica e Aprendizado Hebbiano em Redes Biológicas',
      author: 'Dra. Beatriz Mendes',
      targetNodeId: 'bio-1',
      quote:
        'Redes biológicas regulam ativamente sua excitabilidade para evitar saturação, mantendo o sistema em um regime crítico de máxima capacidade computacional.',
      keyConcepts: ['Plasticidade Homeostática', 'Potenciação LTP', 'Criticalidade', 'Donald Hebb'],
      discoveryLink: {
        fromTitle: 'Topologia Algébrica de Dados',
        fromArea: 'Matemática',
        bridgeConcept: 'Complexos Simpliciais Neurais',
        insight:
          'Cavidades topológicas em matrizes de conectividade sináptica prevêem matematicamente a persistência temporal de memórias de curto prazo.'
      }
    },
    {
      id: 'h3',
      timestamp: 'Há 2 dias',
      date: '22 Out 2026',
      primaryArea: 'Matemática',
      secondaryArea: 'Computação',
      title: 'Topologia Algébrica de Dados em Espaços de Alta Dimensão',
      author: 'Prof. Carlos Rocha',
      targetNodeId: 'mat-1',
      quote:
        'A homologia persistente transforma o ruído de amostras esparsas em invariantes geométricos que descrevem a verdadeira forma topológica do manifold.',
      keyConcepts: ['Homologia Persistente', 'Diagramas de Barcode', 'Complexos Vietoris-Rips', 'Manifolds'],
      discoveryLink: {
        fromTitle: 'Geometria do Espaço Latente em Difusão',
        fromArea: 'Computação',
        bridgeConcept: 'Curvatura de Ricci',
        insight:
          'A contração do espaço latente durante o desruído coincide com o desaparecimento sucessivo de classes de homologia de ordem superior.'
      }
    },
    {
      id: 'h4',
      timestamp: 'Há 4 dias',
      date: '20 Out 2026',
      primaryArea: 'Física',
      secondaryArea: 'Biologia',
      title: 'Termodinâmica de Não-Equilíbrio e Teoria da Informação',
      author: 'Dr. Henrique Silva',
      targetNodeId: 'fis-1',
      quote:
        'O custo entrópico do apagamento de bits estabelece a ponte física irreversível entre termodinâmica estatística e processamento biológico de sinais.',
      keyConcepts: ['Princípio de Landauer', 'Entropia de Shannon', 'Produção de Entropia', 'Sistemas Abertos'],
      discoveryLink: {
        fromTitle: 'Auto-Organização em Redes Metabólicas',
        fromArea: 'Biologia',
        bridgeConcept: 'Teorema de Flutuação',
        insight:
          'Ciclos bioquímicos em vias metabólicas operam no limite exato de dissipação mínima de calor previsto por relações de Jarzynski.'
      }
    },
    {
      id: 'h5',
      timestamp: 'Há 6 dias',
      date: '18 Out 2026',
      primaryArea: 'Humanidades',
      secondaryArea: 'Computação',
      title: 'A Estrutura das Revoluções Científicas na Era da IA Generativa',
      author: 'Dra. Elena Ramos',
      targetNodeId: 'hum-1',
      quote:
        'Quando modelos fundacionais começam a propor hipóteses científicas autônomas, a mudança de paradigma deixa de ser um fenômeno sociológico puramente humano.',
      keyConcepts: ['Paradigmas de Kuhn', 'Epistemologia Computacional', 'Autonomia Científica', 'Filosofia'],
      discoveryLink: {
        fromTitle: 'Redes Neurais em Grafos para Descoberta Molecular',
        fromArea: 'Computação',
        bridgeConcept: 'Falseabilidade Algorítmica',
        insight:
          'O screening algorítmico automatizado altera estruturalmente o critério popperiano de falseabilidade experimental.'
      }
    },
    {
      id: 'h6',
      timestamp: 'Há 1 semana',
      date: '16 Out 2026',
      primaryArea: 'Química',
      secondaryArea: 'Computação',
      title: 'Catálise Supramolecular e Grafos de Reação',
      author: 'Dr. Arthur Faria',
      targetNodeId: 'qui-1',
      quote:
        'Cargas eletrostáticas confinadas em nanogaiolas moleculares dobram a superfície de energia livre, viabilizando rotas cinéticas outrora consideradas proibidas.',
      keyConcepts: ['Nanogaiolas', 'Cinética Supramolecular', 'Superfície de Energia', 'Quimioinformática'],
      discoveryLink: {
        fromTitle: 'GNNs para Descoberta Molecular',
        fromArea: 'Computação',
        bridgeConcept: 'Isomorfismo de Grafos',
        insight:
          'A representação equivariante de grupos de simetria química acelera em mil vezes a predição computacional de estados de transição.'
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

  return (
    <div className="flex-1 h-full overflow-y-auto bg-stone-100 dark:bg-[#070A10] text-stone-900 dark:text-stone-100 select-none">
      <div className="max-w-4xl mx-auto px-6 py-8 lg:py-10 space-y-10">
        {/* ================= SELETOR DE 6 VARIAÇÕES DO PERFIL (NOME E CARGO) ================= */}
        <div className="rounded-2xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-4 space-y-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-400 uppercase tracking-wider">
                Variações do Perfil do Autor:
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold">
                {selectedProfileVariation.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-sans italic">
              {profileVariationOptions.find((v) => v.id === selectedProfileVariation)?.description}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {profileVariationOptions.map((v) => {
              const isActive = selectedProfileVariation === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedProfileVariation(v.id)}
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
        </div>

        {/* ========================================================================= */}
        {/* VARIAÇÃO P1: PASSAPORTE ACADÊMICO SUÍÇO (Assimetria & Tipografia Pura)     */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p1' && (
          <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                {/* Avatar Geométrico Sólido */}
                <div className="w-16 h-16 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center font-editorial text-2xl font-bold tracking-tight shrink-0 shadow-md border border-stone-800 dark:border-stone-200">
                  DV
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-white/10">
                      PESQUISADOR TITULAR
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">• USP #DV-2026</span>
                  </div>

                  <h1 className="font-editorial text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                    Daniel Ventura
                  </h1>

                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-sm text-stone-800 dark:text-stone-200 font-medium">
                      Pesquisador em Ciência da Computação & Sistemas Complexos
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      Laboratório de Inteligência Artificial & Grafos Dinâmicos • USP
                    </p>
                  </div>

                  {/* Links em Pílulas Sólidas */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <a
                      href="https://orcid.org"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-mono text-[10px] font-bold hover:opacity-85 transition-opacity"
                    >
                      <FileText className="w-3 h-3" /> ORCID
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                    <a
                      href="https://scholar.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.06] hover:bg-stone-200 dark:hover:bg-white/[0.1] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" /> Scholar
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.06] hover:bg-stone-200 dark:hover:bg-white/[0.1] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <Code2 className="w-3 h-3" /> GitHub
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                    <a
                      href="https://danielventura.dev"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.06] hover:bg-stone-200 dark:hover:bg-white/[0.1] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <Globe className="w-3 h-3" /> Site
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Proporção de Leitura com Régua Contínua */}
            <div className="border-t border-stone-200/80 dark:border-white/10 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                  Proporção de Áreas Mais Lidas
                </span>
                <span className="font-mono text-[10px] text-stone-400">111 leituras acumuladas</span>
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
                      className="group flex items-center gap-1.5 text-xs font-mono hover:opacity-80 transition-opacity cursor-pointer"
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
        )}

        {/* ========================================================================= */}
        {/* VARIAÇÃO P2: CRACHÁ DE CONGRESSO (Academic ID & Credencial Técnica)        */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p2' && (
          <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Tarja Superior de Congresso Científico */}
            <div className="bg-stone-900 dark:bg-stone-800 text-stone-100 px-6 py-2.5 flex items-center justify-between font-mono text-[11px] font-bold tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONFERÊNCIA DE SISTEMAS COMPLEXOS • CREDENCIAL #DV-2026</span>
              </div>
              <span className="text-stone-400 text-[10px] hidden sm:inline">UNIVERSIDADE DE SÃO PAULO</span>
            </div>

            <div className="p-6 lg:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-18 h-18 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-editorial text-2xl font-bold border-2 border-stone-300 dark:border-white/20 shadow-inner">
                      DV
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[8px] font-bold tracking-wide uppercase">
                      ATIVO
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h1 className="font-editorial text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">
                        Daniel Ventura
                      </h1>
                      <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded">
                        ID: USP-0428
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-sans">
                      <GraduationCap className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="font-semibold">Pesquisador em Computação & Sistemas Complexos</span>
                      <span className="text-stone-400">• USP</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-500 text-white font-bold">
                        #IA Mecanística
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">
                        #Plasticidade Neural
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-violet-500 text-white font-bold">
                        #Topologia de Dados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco de Links em Crachá */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href="https://orcid.org"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                  >
                    <span>ORCID: 0000-0002-1825</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                  <a
                    href="https://scholar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                  >
                    <span>Google Scholar Profile</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Barra de Proporção */}
              <div className="border-t border-stone-200/80 dark:border-white/10 pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400 uppercase font-bold">Distribuição de Leitura</span>
                  <span className="text-stone-500">111 artigos arquivados</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-stone-200 dark:bg-white/10 gap-[2px]">
                  {readingProportions.map((item) => {
                    const theme = SCIENTIFIC_AREAS[item.area];
                    return (
                      <div
                        key={item.area}
                        onClick={() => handleFilterArea(item.area)}
                        title={`${item.area}: ${item.percent}%`}
                        className="h-full cursor-pointer hover:opacity-90"
                        style={{ width: `${item.percent}%`, backgroundColor: theme.accentColor }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VARIAÇÃO P3: FICHA MASTHEAD (Editorial de Revista Científica)              */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p3' && (
          <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-8 shadow-xl space-y-6">
            <div className="border-b border-stone-200/80 dark:border-white/10 pb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                Revista Interface Científica • Ficha do Autor
              </span>
              <span className="font-mono text-[10px] text-stone-400">Edição 2026</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-stone-900 dark:border-white flex items-center justify-center font-editorial text-2xl font-bold shrink-0">
                DV
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="font-editorial text-3xl font-bold text-stone-900 dark:text-stone-100">
                    Daniel Ventura
                  </h1>
                  <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                    Pesquisador no Departamento de Ciência da Computação da Universidade de São Paulo (USP)
                  </p>
                </div>

                <p className="font-editorial text-sm italic text-stone-700 dark:text-stone-300 leading-relaxed border-l-2 border-stone-300 dark:border-white/20 pl-3">
                  "Investiga as intersecções matemáticas entre redes biológicas, interpretabilidade de modelos de fundação e a geometria da informação em alta dimensão."
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-stone-600 dark:text-stone-300 pt-1 flex-wrap">
                  <a href="https://orcid.org" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-bold">
                    ORCID: 0000-0002-1825-0097 <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a href="https://scholar.google.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    Google Scholar <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    GitHub <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <a href="https://danielventura.dev" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    Página Oficial <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Barra de Leitura Estilo Masthead */}
            <div className="border-t border-stone-200/80 dark:border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-stone-400 uppercase text-[10px]">Índice de Leituras Publicadas</span>
                <span className="text-stone-500">111 leituras</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden flex bg-stone-200 dark:bg-white/10 gap-[2px]">
                {readingProportions.map((item) => (
                  <div
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    className="h-full cursor-pointer hover:opacity-90"
                    style={{ width: `${item.percent}%`, backgroundColor: SCIENTIFIC_AREAS[item.area].accentColor }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VARIAÇÃO P4: TERMINAL SYS-LAB (Unix Workstation & Estação de Pesquisa)     */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p4' && (
          <section className="rounded-3xl border border-stone-300 dark:border-white/15 bg-stone-900 text-stone-100 p-6 lg:p-7 shadow-2xl font-mono space-y-5">
            {/* Header de Janela de Terminal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 font-bold text-stone-300">usr@usp-lab:~/profile</span>
              </div>
              <span className="text-[10px]">BASH • UTF-8</span>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>❯ whoami --academic-profile</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400">NAME:</span>
                  <span className="text-white font-bold text-sm">"Daniel Ventura"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400">ROLE:</span>
                  <span className="text-cyan-300">"Pesquisador em Ciência da Computação & Sistemas Complexos"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400">INSTITUTION:</span>
                  <span className="text-stone-300">"Universidade de São Paulo (USP)"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400">LAB:</span>
                  <span className="text-stone-300">"Sistemas Complexos, IA Mecanística & Manifolds"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400">ORCID:</span>
                  <span className="text-emerald-300 font-bold">"0000-0002-1825-0097"</span>
                </div>
              </div>

              {/* Comandos Executáveis de Links */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                <a
                  href="https://orcid.org"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-emerald-400 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <span>$ ./orcid</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-cyan-400 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <span>$ ./scholar</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-violet-400 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <span>$ ./github</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://danielventura.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <span>$ ./site</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Barra de Áreas em Buffer de Memória */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>MEMORY_BUFFER::READ_AREAS</span>
                  <span>111_ENTRIES</span>
                </div>
                <div className="w-full h-3 rounded bg-black/60 overflow-hidden flex p-[1px] gap-[2px]">
                  {readingProportions.map((item) => (
                    <div
                      key={item.area}
                      onClick={() => handleFilterArea(item.area)}
                      title={`${item.area}: ${item.percent}%`}
                      className="h-full cursor-pointer hover:opacity-80"
                      style={{ width: `${item.percent}%`, backgroundColor: SCIENTIFIC_AREAS[item.area].accentColor }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VARIAÇÃO P5: DOSSIER MÉTRICAS (Grade Analítica com KPIs de Pesquisa)       */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p5' && (
          <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 flex items-center justify-center font-editorial text-xl font-bold shrink-0">
                  DV
                </div>
                <div>
                  <h1 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Daniel Ventura
                  </h1>
                  <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    Pesquisador • Ciência da Computação & Sistemas Complexos • USP
                  </p>
                </div>
              </div>

              {/* Links em Pílulas Compactas */}
              <div className="flex items-center gap-2">
                <a
                  href="https://orcid.org"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                >
                  ORCID
                </a>
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                >
                  Scholar
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-stone-200/80 dark:border-white/10 font-mono text-[10px] text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Três Cards de KPIs em Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>LEITURAS TOTAIS</span>
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                  111
                </div>
                <div className="text-[11px] text-stone-500 font-sans">Artigos lidos e analisados</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>ÁREAS ATIVAS</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                  6 / 6
                </div>
                <div className="text-[11px] text-stone-500 font-sans">Campos transdisciplinares</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>FOCO DOMINANTE</span>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="font-mono text-3xl font-bold text-cyan-500">
                  38%
                </div>
                <div className="text-[11px] text-stone-500 font-sans">Computação & IA (42 textos)</div>
              </div>
            </div>

            {/* Barra de Distribuição de Áreas */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-stone-200 dark:bg-white/10 gap-[2px]">
                {readingProportions.map((item) => (
                  <div
                    key={item.area}
                    onClick={() => handleFilterArea(item.area)}
                    className="h-full cursor-pointer hover:opacity-90"
                    style={{ width: `${item.percent}%`, backgroundColor: SCIENTIFIC_AREAS[item.area].accentColor }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VARIAÇÃO P6: MONOLITO CONTEMPORÂNEO (Card de Visita Duplo & Divisão 50/50)  */}
        {/* ========================================================================= */}
        {selectedProfileVariation === 'p6' && (
          <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Coluna Esquerda: Identidade do Autor */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-stone-950 flex items-center justify-center font-editorial text-2xl font-bold shrink-0">
                    DV
                  </div>
                  <div>
                    <h1 className="font-editorial text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">
                      Daniel Ventura
                    </h1>
                    <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                      Pesquisador em Computação • USP
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                  Pesquisador em Ciência da Computação & Sistemas Complexos na Universidade de São Paulo. Estudo de redes neurais, dinâmica não-linear e topologia de dados.
                </p>

                {/* Grade 2x2 com Links Externos */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <a
                    href="https://orcid.org"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 flex items-center justify-between hover:bg-stone-200 transition-colors"
                  >
                    <span>ORCID 0000-0002</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://scholar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 flex items-center justify-between hover:bg-stone-200 transition-colors"
                  >
                    <span>Scholar Profile</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 flex items-center justify-between hover:bg-stone-200 transition-colors"
                  >
                    <span>GitHub Repos</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <a
                    href="https://danielventura.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 flex items-center justify-between hover:bg-stone-200 transition-colors"
                  >
                    <span>Site do Autor</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Coluna Direita: Distribuição de Disciplinas em Barras */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-stone-500 uppercase text-[10px]">Distribuição de Leituras</span>
                  <span className="text-stone-400">111 artigos</span>
                </div>

                <div className="space-y-2">
                  {readingProportions.map((item) => {
                    const theme = SCIENTIFIC_AREAS[item.area];
                    return (
                      <div
                        key={item.area}
                        onClick={() => handleFilterArea(item.area)}
                        className="group space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-700 dark:text-stone-300 font-medium group-hover:underline">
                            {item.area}
                          </span>
                          <span className="text-stone-400 font-bold">{item.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.percent}%`, backgroundColor: theme.accentColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* ================= 3. HISTÓRICO RECENTE: LINHAGEM DE DESCOBERTA ================= */}
        <section className="rounded-3xl border border-stone-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0C101B]/95 backdrop-blur-xl p-6 lg:p-7 space-y-6 shadow-xl">
          {/* Cabeçalho da Seção com Título e Filtro por Área */}
          <div className="space-y-4 border-b border-stone-200/80 dark:border-white/10 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    Histórico Recente
                    <span className="text-xs font-mono font-normal text-stone-400">
                      • Linhagem de Descoberta
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    Árvore genealógica de ideias e conexões transdisciplinares encadeadas
                  </p>
                </div>
              </div>
            </div>

            {/* Filtro Rápido por Área Científica */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] font-mono no-scrollbar">
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
                    <span className="text-[9px] font-mono opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linhagem de Descoberta (Árvore Genealógica de Ideias) */}
          <div className="relative pl-6 space-y-6">
            {/* Linha vertical contínua da linhagem */}
            <div className="absolute left-3 top-3 bottom-3 w-[2px] bg-stone-300 dark:bg-white/15 border-dashed" />

            {filteredEntries.map((item) => {
              const primaryTheme = SCIENTIFIC_AREAS[item.primaryArea];
              const fromTheme = item.discoveryLink
                ? SCIENTIFIC_AREAS[item.discoveryLink.fromArea]
                : null;
              const isHovered = hoveredCardId === `lineage-${item.id}`;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCardId(`lineage-${item.id}`)}
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

                  {/* Citação memorável */}
                  <div className="relative pl-3.5 py-1.5 my-2.5 border-l-2 border-stone-300 dark:border-white/20 bg-stone-100/60 dark:bg-white/[0.02] rounded-r-lg">
                    <p className="font-editorial text-xs italic text-stone-600 dark:text-stone-300 leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Raciocínio & Conceitos */}
                  {item.discoveryLink && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed pt-1">
                      <strong className="font-mono text-[11px] text-stone-400">Raciocínio da Conexão: </strong>
                      {item.discoveryLink.insight}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-stone-200/40 dark:border-white/5 mt-2.5">
                    {item.keyConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="font-mono text-[9px] px-2 py-0.5 rounded bg-stone-200/70 dark:bg-white/5 text-stone-600 dark:text-stone-400"
                      >
                        #{concept}
                      </span>
                    ))}
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
