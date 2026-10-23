import { PublicationNode, PublicationConnection } from '../types';

export const INITIAL_NODES: PublicationNode[] = [
  // --- BIOLOGIA ---
  {
    id: 'bio-1',
    title: 'Plasticidade Sináptica e Aprendizado Hebbiano em Redes Biológicas',
    slug: 'plasticidade-sinaptica-redes-biologicas',
    author: {
      name: 'Dra. Beatriz Mendes',
      role: 'Neurocientista / USP',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      reputation: 94
    },
    area: 'Biologia',
    subtopic: 'Neurociência',
    type: 'Ideia',
    excerpt: 'Como neurônios reconfiguram conexões sinápticas sob estimulação repetida e o paralelo com aprendizado de máquina.',
    content: `O cérebro biológico não atualiza pesos sinápticos via retropropagação de gradientes global. Em vez disso, mecanismos puramente locais, como a potenciação de longa duração (LTP), coordenam a adaptação de conexões neuronais.

A famosa regra formulada por Donald Hebb ("neurônios que disparam juntos, conectam-se juntos") inspirou os primeiros modelos de redes associativas. No entanto, descobertas recentes em plasticidade homeostática revelam que redes biológicas regulam ativamente sua excitabilidade para evitar saturação, mantendo o sistema em um regime crítico de máxima capacidade computacional.

Essa estabilidade autônoma é fundamental para entender como o córtex processa fluxos contínuos de informação sem sofrer de esquecimento catastrófico.`,
    tags: ['neurociência', 'plasticidade', 'sinapses', 'aprendizado'],
    references: [
      {
        title: 'Synaptic plasticity forms the basis of learning and memory',
        authors: 'Bliss, T. V., & Collingridge, G. L.',
        year: 1993,
        doi: '10.1038/361031a0'
      }
    ],
    reactions: { '💡': 42, '🔬': 18, '🔗': 29, '❓': 5, '🤔': 2, '❤️': 31 },
    annotations: [
      {
        id: 'ann-1',
        selectedText: 'redes biológicas regulam ativamente sua excitabilidade para evitar saturação, mantendo o sistema em um regime crítico',
        highlightCount: 38,
        commentsCount: 6,
        notes: [
          {
            id: 'n1',
            author: 'Prof. Carlos Rocha',
            text: 'Isso se relaciona diretamente com o conceito de criticalidade auto-organizada da Física!',
            createdAt: '2 horas atrás'
          }
        ]
      }
    ],
    views: 1420,
    saves: 310,
    createdAt: '2026-10-18'
  },
  {
    id: 'bio-2',
    title: 'Topologia e Robustez de Redes Genéticas Regulatórias',
    slug: 'topologia-redes-geneticas-regulatorias',
    author: {
      name: 'Dr. Lucas Arantes',
      role: 'Biomédico & Geneticista / Fiocruz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      reputation: 88
    },
    area: 'Biologia',
    subtopic: 'Genética de Sistemas',
    type: 'Resultado',
    excerpt: 'Análise de grafos em redes transcricionais demonstra arquitetura livre de escala e tolerância extrema a falhas.',
    content: `Redes regulatórias genéticas não são aleatórias. Demonstramos através do mapeamento de fatores de transcrição em leveduras e bactérias que essas redes seguem uma distribuição de lei de potência em seus graus de conectividade.

A presença de hubs regulatórios permite coordenação rápida de respostas celulares a estresses ambientais, enquanto a maioria dos genes periféricos isola ruídos casuais, protegendo a estabilidade do fenótipo.`,
    tags: ['genômica', 'teoria-dos-grafos', 'redes-complexas', 'robustez'],
    reactions: { '💡': 31, '🔬': 22, '🔗': 37, '❓': 3, '🤔': 1, '❤️': 14 },
    annotations: [],
    views: 980,
    saves: 195,
    createdAt: '2026-10-19'
  },
  {
    id: 'bio-3',
    title: 'Circuitos Genéticos Sintéticos e Portas Lógicas em Bactérias',
    slug: 'circuitos-geneticos-portas-logicas-bacterias',
    author: {
      name: 'Mariana Duarte',
      role: 'Bióloga Sintética / Unicamp',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      reputation: 82
    },
    area: 'Biologia',
    subtopic: 'Biologia Sintética',
    type: 'Projeto',
    excerpt: 'Implementação de portas lógicas AND/OR vivas utilizando promotores genéticos acoplados.',
    content: `Estamos construindo cepas de E. coli capazes de computar equações booleanas a partir de concentrações de marcadores moleculares no meio ambiente. Usando cascatas de repressão de transcrição, os microrganismos atuam como biossensores autônomos inteligentes.`,
    tags: ['biologia-sintética', 'portas-lógicas', 'computação-biológica'],
    reactions: { '💡': 55, '🔬': 34, '🔗': 45, '❓': 12, '🤔': 4, '❤️': 26 },
    annotations: [],
    views: 1890,
    saves: 420,
    createdAt: '2026-10-20'
  },
  {
    id: 'bio-4',
    title: 'Migração de Populações e Dinâmica de Cardumes Auto-Organizados',
    slug: 'dinamica-cardumes-auto-organizados',
    author: {
      name: 'Thiago Nogueira',
      role: 'Ecólogo Teórico',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      reputation: 79
    },
    area: 'Biologia',
    subtopic: 'Ecologia Comportamental',
    type: 'Experiência',
    excerpt: 'Regras visuais simples entre indivíduos vizinhos explicam a formação de padrões complexos em enxames.',
    content: `Sem nenhum líder centralizado, cardumes e revoadas de pássaros mantêm coesão fluida através de regras puramente locais: alinhamento de velocidade com vizinhos próximos, atração em direção ao centro de massa local e repulsão em curta distância.`,
    tags: ['enxames', 'auto-organização', 'ecologia'],
    reactions: { '💡': 28, '🔬': 9, '🔗': 19, '❓': 2, '🤔': 0, '❤️': 18 },
    annotations: [],
    views: 740,
    saves: 110,
    createdAt: '2026-10-15'
  },
  {
    id: 'bio-5',
    title: 'Dobramento de Proteínas: Além das Soluções Preditivas por IA',
    slug: 'dobramento-proteinas-alem-da-ia',
    author: {
      name: 'Dr. Roberto Silveira',
      role: 'Biofísico Molecular',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      reputation: 91
    },
    area: 'Biologia',
    subtopic: 'Biologia Molecular',
    type: 'Discussão',
    excerpt: 'Embora redes neurais resolvam a estrutura tridimensional estática, a cinética energética e alosteria continuam em aberto.',
    content: `O sucesso estrondoso de modelos como AlphaFold prevê o estado de equilíbrio final com incrível precisão. Porém, a paisagem energética pela qual uma cadeia polipeptídica transita durante seu dobramento em milissegundos exige termodinâmica estatística rigorosa.`,
    tags: ['proteínas', 'biofísica', 'termodinâmica', 'alphafold'],
    reactions: { '💡': 61, '🔬': 42, '🔗': 38, '❓': 9, '🤔': 8, '❤️': 27 },
    annotations: [],
    views: 2300,
    saves: 530,
    createdAt: '2026-10-16'
  },

  // --- QUÍMICA ---
  {
    id: 'qui-1',
    title: 'Síntese de Materiais Bidimensionais Além do Grafeno (MXenes)',
    slug: 'sintese-materiais-2d-mxenes',
    author: {
      name: 'Dra. Helena Valente',
      role: 'Química de Materiais / IQ-USP',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      reputation: 89
    },
    area: 'Química',
    subtopic: 'Nanotecnologia',
    type: 'Resultado',
    excerpt: 'Carbetos e nitretos de metais de transição com condutividade metálica e hidrofilia para armazenamento de energia.',
    content: `MXenes oferecem propriedades elétricas incomuns porque combinam a altíssima condutividade típica de metais com superfícies hidrofílicas ricas em grupos funcionais oxigenados e fluorados. Essa dualidade viabiliza baterias de íon-lítio ultra rápidas e supercapacitores compactos.`,
    tags: ['mxenes', 'materiais-2d', 'nanotecnologia', 'energia'],
    reactions: { '💡': 40, '🔬': 32, '🔗': 21, '❓': 4, '🤔': 1, '❤️': 19 },
    annotations: [],
    views: 1100,
    saves: 240,
    createdAt: '2026-10-17'
  },
  {
    id: 'qui-2',
    title: 'Catálise Supramolecular Inspirada em Sítios Ativos Enzimáticos',
    slug: 'catalise-supramolecular-enzimatica',
    author: {
      name: 'Prof. André Fogaça',
      role: 'Químico Orgânico',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      reputation: 86
    },
    area: 'Química',
    subtopic: 'Química Supramolecular',
    type: 'Ideia',
    excerpt: 'Gaiolas moleculares auto-montadas capazes de acelerar reações químicas sob condições brandas de temperatura.',
    content: `Cápsulas e caixas supramoleculares sintetizadas em laboratório conseguem confinar reagentes, criando microambientes hidrofóbicos que forçam contatos estereoquímicos com baixíssima energia de ativação, mimetizando a eficiência das enzimas biológicas.`,
    tags: ['supramolecular', 'catálise', 'enzimas', 'bioquímica'],
    reactions: { '💡': 33, '🔬': 19, '🔗': 27, '❓': 5, '🤔': 0, '❤️': 12 },
    annotations: [],
    views: 890,
    saves: 160,
    createdAt: '2026-10-18'
  },
  {
    id: 'qui-3',
    title: 'Modelagem Quântica de Estruturas Metal-Orgânicas (MOFs)',
    slug: 'modelagem-quantica-mofs-captura-carbono',
    author: {
      name: 'Clarice Peixoto',
      role: 'Química Computacional',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      reputation: 84
    },
    area: 'Química',
    subtopic: 'Química Computacional',
    type: 'Projeto',
    excerpt: 'Triagem de milhares de nanoporos cristalinos para captura e conversão catalítica de CO2 atmosférico.',
    content: `Utilizando cálculos de teoria do funcional da densidade (DFT) aliados a redes neurais de potenciais interatômicos, aceleramos a triagem de novos MOFs por ordens de grandeza em relação a experimentos de síntese em bancada.`,
    tags: ['mofs', 'captura-de-carbono', 'química-computacional', 'dft'],
    reactions: { '💡': 47, '🔬': 28, '🔗': 39, '❓': 6, '🤔': 2, '❤️': 22 },
    annotations: [],
    views: 1350,
    saves: 305,
    createdAt: '2026-10-19'
  },
  {
    id: 'qui-4',
    title: 'Dinâmica de Reações em Condições Extremas no Espaço Interestelar',
    slug: 'astroquimica-reacoes-gelo-interestelar',
    author: {
      name: 'Dr. Fernando Dias',
      role: 'Astroquímico',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      reputation: 87
    },
    area: 'Química',
    subtopic: 'Astroquímica',
    type: 'Descoberta',
    excerpt: 'Tunelamento quântico permite reações de síntese de moléculas prebióticas a 10 Kelvin em grãos de poeira cósmica.',
    content: `Na ausência de energia térmica convencional em nuvens moleculares frias, o tunelamento de prótons e átomos de hidrogênio através de barreiras energéticas viabiliza a formação de aminoácidos primordiais antes mesmo da agregação de novos sistemas planetários.`,
    tags: ['astroquímica', 'tunelamento-quântico', 'origem-da-vida'],
    reactions: { '💡': 68, '🔬': 45, '🔗': 41, '❓': 8, '🤔': 3, '❤️': 39 },
    annotations: [],
    views: 2100,
    saves: 480,
    createdAt: '2026-10-14'
  },
  {
    id: 'qui-5',
    title: 'Polímeros Autorregenerativos com Ligações Covalentes Dinâmicas',
    slug: 'polimeros-autorregenerativos-vitrimeros',
    author: {
      name: 'Luísa Bastos',
      role: 'Engenheira Química',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
      reputation: 80
    },
    area: 'Química',
    subtopic: 'Química de Polímeros',
    type: 'Resultado',
    excerpt: 'Vitrímeros que recuperam 98% da integridade mecânica após fratura mediante leve aquecimento térmico.',
    content: `Ao incorporar reações de transesterificação dinâmica em redes tridimensionais termofixas, o material flui viscoelasticamente sob temperatura sem perder a reticulação molecular, permitindo reciclagem infinita e autocura estrutural.`,
    tags: ['vitrimeros', 'sustentabilidade', 'polimeros', 'materiais-inteligentes'],
    reactions: { '💡': 29, '🔬': 15, '🔗': 12, '❓': 3, '🤔': 1, '❤️': 16 },
    annotations: [],
    views: 820,
    saves: 140,
    createdAt: '2026-10-17'
  },

  // --- FÍSICA ---
  {
    id: 'fis-1',
    title: 'Criticalidade Auto-Organizada e Leis de Potência em Sistemas Físicos',
    slug: 'criticalidade-auto-organizada-sistemas-complexos',
    author: {
      name: 'Prof. Henrique Moretti',
      role: 'Físico Teórico / IF-USP',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      reputation: 96
    },
    area: 'Física',
    subtopic: 'Mecânica Estatística',
    type: 'Explicação',
    excerpt: 'Como sistemas dinâmicos complexos sintonizam a si mesmos na fronteira tênue entre ordem e caos.',
    content: `Introduzido originalmente por Per Bak através do modelo da pilha de areia, o conceito de criticalidade auto-organizada (SOC) descreve sistemas onde avalanches e perturbações de todos os tamanhos obedecem a leis de potência universais, sem necessidade de sintonia fina externa.

Esse princípio unifica fenômenos que vão de terremotos e flares solares até a dinâmica de disparos sincronizados no córtex cerebral e flutuações financeiras de alta frequência.`,
    tags: ['criticalidade', 'sistemas-complexos', 'leis-de-potência', 'caos'],
    references: [
      {
        title: 'Self-organized criticality: An explanation of the 1/f noise',
        authors: 'Bak, P., Tang, C., & Wiesenfeld, K.',
        year: 1987,
        doi: '10.1103/PhysRevLett.59.381'
      }
    ],
    reactions: { '💡': 84, '🔬': 39, '🔗': 62, '❓': 7, '🤔': 3, '❤️': 45 },
    annotations: [
      {
        id: 'ann-2',
        selectedText: 'Esse princípio unifica fenômenos que vão de terremotos e flares solares até a dinâmica de disparos sincronizados no córtex cerebral',
        highlightCount: 44,
        commentsCount: 9,
        notes: [
          {
            id: 'n2',
            author: 'Dra. Beatriz Mendes',
            text: 'Exato! A hipótese do cérebro crítico postula que o processamento ótimo de informação ocorre nesse ponto exato.',
            createdAt: '1 dia atrás'
          }
        ]
      }
    ],
    views: 2890,
    saves: 720,
    createdAt: '2026-10-14'
  },
  {
    id: 'fis-2',
    title: 'Fases Topológicas da Matéria e Supercondutores Não-Convencionais',
    slug: 'fases-topologicas-materia-supercondutores',
    author: {
      name: 'Dr. Renato Kuntz',
      role: 'Físico da Matéria Condensada',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
      reputation: 92
    },
    area: 'Física',
    subtopic: 'Matéria Condensada',
    type: 'Resultado',
    excerpt: 'Isolantes topológicos conduzem corrente elétrica sem perdas dissipativas em suas bordas e superfícies.',
    content: `Propriedades protegidas por invariantes topológicos da estrutura de bandas eletrônicas impedem o espalhamento de elétrons por impurezas locais. Esse comportamento oferece fundamentos físicos cruciais para a realização de qubits quânticos topologicamente protegidos contra decoerência.`,
    tags: ['topologia', 'supercondutividade', 'física-quântica', 'qubits'],
    reactions: { '💡': 51, '🔬': 36, '🔗': 42, '❓': 11, '🤔': 2, '❤️': 24 },
    annotations: [],
    views: 1670,
    saves: 390,
    createdAt: '2026-10-17'
  },
  {
    id: 'fis-3',
    title: 'Termodinâmica da Informação e o Paradoxo do Demônio de Maxwell',
    slug: 'termodinamica-da-informacao-landauer',
    author: {
      name: 'Gabriel Sampaio',
      role: 'Pesquisador de Óptica Quântica',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
      reputation: 85
    },
    area: 'Física',
    subtopic: 'Física da Informação',
    type: 'Explicação',
    excerpt: 'O limite de Landauer: apagar 1 bit de informação física dissipa uma quantidade mínima de calor igual a kT ln(2).',
    content: `Informação não é uma abstração etérea: informação é estritamente física. Experimentos recentes utilizando pinças ópticas e microesferas de vidro em armadilhas de laser confirmaram que a conversão entre entropia termodinâmica e informação de Shannon atinge com exatidão a barreira predita por Rolf Landauer.`,
    tags: ['termodinâmica', 'teoria-da-informação', 'entropia', 'landauer'],
    reactions: { '💡': 63, '🔬': 27, '🔗': 50, '❓': 6, '🤔': 1, '❤️': 35 },
    annotations: [],
    views: 2050,
    saves: 460,
    createdAt: '2026-10-18'
  },
  {
    id: 'fis-4',
    title: 'Gravitação Quântica em Loop e Discretude Fundamental do Espaço-Tempo',
    slug: 'gravitacao-quantica-loop-espaco-discreto',
    author: {
      name: 'Dr. Otávio Ramos',
      role: 'Cosmólogo Teórico',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
      reputation: 90
    },
    area: 'Física',
    subtopic: 'Gravitação Quântica',
    type: 'Hipótese',
    excerpt: 'Na escala de Planck, o espaço contínuo é substituído por uma rede polimérica de spin networks quantizadas.',
    content: `A geometria não é um pano de fundo passivo onde partículas se movimentam: a própria métrica gravitacional é quantizada em volumes e áreas mínimas e indivisíveis. A representação matemática dessa trama apoia-se em redes de nós e arestas conexas chamadas redes de spin.`,
    tags: ['gravitação-quântica', 'spin-networks', 'relatividade', 'cosmologia'],
    reactions: { '💡': 58, '🔬': 21, '🔗': 33, '❓': 15, '🤔': 7, '❤️': 33 },
    annotations: [],
    views: 1800,
    saves: 410,
    createdAt: '2026-10-13'
  },
  {
    id: 'fis-5',
    title: 'Transições de Fase Quântica em Baixas Dimensões',
    slug: 'transicoes-fase-quantica-baixas-dimensoes',
    author: {
      name: 'Camila Peçanha',
      role: 'Física Experimental',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      reputation: 81
    },
    area: 'Física',
    subtopic: 'Física Quântica',
    type: 'Resultado',
    excerpt: 'Flutuações quânticas no ponto de zero absoluto induzem reorganizações drásticas de ordenamento magnético.',
    content: `Diferente das transições clássicas acionadas por temperatura (como a água fervendo), transições quânticas ocorrem no zero absoluto modulando parâmetros externos como campo magnético ou pressão hidrostática, governadas pela física de pontos críticos quânticos.`,
    tags: ['pontos-críticos', 'magnetismo', 'transição-de-fase'],
    reactions: { '💡': 34, '🔬': 18, '🔗': 16, '❓': 4, '🤔': 1, '❤️': 15 },
    annotations: [],
    views: 910,
    saves: 180,
    createdAt: '2026-10-19'
  },

  // --- MATEMÁTICA ---
  {
    id: 'mat-1',
    title: 'Teoria Espectral de Grafos e Isomorfismo em Redes Densas',
    slug: 'teoria-espectral-grafos-isomorfismo',
    author: {
      name: 'Prof. Marcelo Prado',
      role: 'Matemático / IMPA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      reputation: 95
    },
    area: 'Matemática',
    subtopic: 'Teoria dos Grafos',
    type: 'Ideia',
    excerpt: 'Os autovalores e autovetores da matriz Laplaciana revelam clusters ocultos, conectividade e propriedades de fluxo.',
    content: `Analisar o espectro da matriz Laplaciana de um grafo fornece uma lente contínua sobre uma estrutura estritamente combinatória. O segundo menor autovalor (conectividade algébrica de Fiedler) determina quão facilmente o grafo pode ser particionado em comunidades coesas.

Essa ponte entre álgebra linear e topologia discreta é a espinha dorsal de algoritmos de clustering espectral e redes neurais de grafos (GNNs).`,
    tags: ['grafos', 'álgebra-linear', 'laplaciano', 'redes'],
    references: [
      {
        title: 'Algebraic Connectivity of Graphs',
        authors: 'Fiedler, M.',
        year: 1973,
        doi: '10.21136/CMJ.1973.101168'
      }
    ],
    reactions: { '💡': 72, '🔬': 29, '🔗': 58, '❓': 8, '🤔': 2, '❤️': 38 },
    annotations: [],
    views: 2450,
    saves: 610,
    createdAt: '2026-10-15'
  },
  {
    id: 'mat-2',
    title: 'Análise Topológica de Dados (TDA) e Homologia Persistente',
    slug: 'analise-topologica-dados-homologia-persistente',
    author: {
      name: 'Dra. Vanessa Lima',
      role: 'Topologista Aplicada',
      avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=120&q=80',
      reputation: 91
    },
    area: 'Matemática',
    subtopic: 'Topologia Algébrica',
    type: 'Explicação',
    excerpt: 'Detectando vazios, laços e cavidades multidimensionais em nuvens ruidosas de dados pontuais.',
    content: `Homologia persistente constrói complexos simpliciais em múltiplas escalas métricas para rastrear feições topológicas invariantes a rotações, deformações e ruídos. Isso permite mapear a geometria profunda de variedades latentes em espaços de alta dimensão.`,
    tags: ['topologia', 'tda', 'ciência-de-dados', 'geometria'],
    reactions: { '💡': 65, '🔬': 33, '🔗': 46, '❓': 9, '🤔': 1, '❤️': 30 },
    annotations: [],
    views: 1980,
    saves: 490,
    createdAt: '2026-10-18'
  },
  {
    id: 'mat-3',
    title: 'Sistemas Dinâmicos e Teoria Ergódica em Mecânica Estatística',
    slug: 'sistemas-dinamicos-teoria-ergodica',
    author: {
      name: 'Guilherme Toledo',
      role: 'Pesquisador em Dinâmica Não-Linear',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      reputation: 83
    },
    area: 'Matemática',
    subtopic: 'Sistemas Dinâmicos',
    type: 'Discussão',
    excerpt: 'Quando médias temporais ao longo de uma trajetória coincidem com médias espaciais em todo o espaço de fase.',
    content: `A hipótese ergódica fornece a justificativa matemática para a mecânica estatística de Boltzmann. Investigamos sob quais condições de caos hamiltoniano atratores estranhos garantem que o sistema explore uniformemente a hipersuperfície de energia constante.`,
    tags: ['dinâmica', 'teoria-ergódica', 'caos', 'estatística'],
    reactions: { '💡': 39, '🔬': 17, '🔗': 26, '❓': 5, '🤔': 3, '❤️': 18 },
    annotations: [],
    views: 1120,
    saves: 220,
    createdAt: '2026-10-16'
  },
  {
    id: 'mat-4',
    title: 'Teoria da Informação de Shannon e Limites de Entropia em Redes',
    slug: 'teoria-informacao-shannon-entropia-redes',
    author: {
      name: 'Prof. Artur Vilas',
      role: 'Matemático & Engenheiro de Telecomunicações',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      reputation: 93
    },
    area: 'Matemática',
    subtopic: 'Teoria da Informação',
    type: 'Ideia',
    excerpt: 'Quantificando incerteza, capacidade de canal e compressão ótima em grafos de comunicação ponderados.',
    content: `Claude Shannon formalizou que o limite fundamental de transmissão confiável através de um canal com ruído depende puramente da entropia relativa. Quando estendida para redes multi-terminais, a taxa de transferência ótima requer sincronização de fluxos topológicos e codificação de rede linear.`,
    tags: ['shannon', 'entropia', 'redes-de-informação', 'probabilidade'],
    reactions: { '💡': 81, '🔬': 31, '🔗': 59, '❓': 4, '🤔': 2, '❤️': 40 },
    annotations: [],
    views: 2600,
    saves: 650,
    createdAt: '2026-10-17'
  },
  {
    id: 'mat-5',
    title: 'A Geometria Diferencial das Variedades de Riemann no Aprendizado',
    slug: 'geometria-diferencial-variedades-riemann',
    author: {
      name: 'Juliana Falcão',
      role: 'Geômetra Diferencial',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      reputation: 87
    },
    area: 'Matemática',
    subtopic: 'Geometria Riemanniana',
    type: 'Artigo',
    excerpt: 'Métricas não-euclidianas hiperbólicas para embutimento hierárquico ótimo com distorção quase nula.',
    content: `Grafos hierárquicos e árvores filogenéticas expandem seu volume exponencialmente conforme o raio cresce. Espaços euclidianos sofrem de gargalos severos de distorção dimensional, enquanto variedades hiperbólicas de Poincaré acomodam hierarquias profundas com curvatura negativa constante.`,
    tags: ['geometria-hiperbólica', 'variedades', 'otimização'],
    reactions: { '💡': 59, '🔬': 26, '🔗': 41, '❓': 7, '🤔': 2, '❤️': 29 },
    annotations: [],
    views: 1720,
    saves: 395,
    createdAt: '2026-10-19'
  },

  // --- COMPUTAÇÃO ---
  {
    id: 'comp-1',
    title: 'Redes Neurais de Grafos (GNNs) para Previsão Molecular',
    slug: 'redes-neurais-grafos-gnn-previsao-molecular',
    author: {
      name: 'Danilo Alencar',
      role: 'Engenheiro de IA / Deep Learning',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      reputation: 92
    },
    area: 'Computação',
    subtopic: 'Inteligência Artificial',
    type: 'Projeto',
    excerpt: 'Utilizando passagem de mensagens entre átomos e ligações químicas para acelerar a descoberta de novos fármacos.',
    content: `Diferente de imagens (grades 2D) ou textos (sequências 1D), moléculas químicas são grafos não-euclidianos arbitrários. Redes GNN com equivariância geométrica garantem que previsões de propriedades como toxicidade e afinidade de ligação sejam invariantes a rotações espaciais e permutações de índices.`,
    tags: ['gnn', 'machine-learning', 'química-computacional', 'ia'],
    reactions: { '💡': 77, '🔬': 41, '🔗': 64, '❓': 9, '🤔': 3, '❤️': 48 },
    annotations: [
      {
        id: 'ann-3',
        selectedText: 'Redes GNN com equivariância geométrica garantem que previsões de propriedades como toxicidade e afinidade de ligação sejam invariantes a rotações espaciais',
        highlightCount: 31,
        commentsCount: 4,
        notes: [
          {
            id: 'n3',
            author: 'Clarice Peixoto',
            text: 'Isso permitiu simular nossos cristais MOF em tempo recorde!',
            createdAt: '1 dia atrás'
          }
        ]
      }
    ],
    views: 2950,
    saves: 780,
    createdAt: '2026-10-18'
  },
  {
    id: 'comp-2',
    title: 'Modelos de Difusão e Termodinâmica de Não-Equilíbrio',
    slug: 'modelos-difusao-termodinamica-gerativa',
    author: {
      name: 'Lucas Vianna',
      role: 'Cientista da Computação & Pesquisador',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      reputation: 89
    },
    area: 'Computação',
    subtopic: 'Modelos Generativos',
    type: 'Explicação',
    excerpt: 'A matemática da difusão de Langevin reversa transforma ruído gaussiano em estruturas semânticas coerentes.',
    content: `Os modelos generativos mais avançados da atualidade derivam diretamente de equações de difusão de Langevin desenvolvidas pela física estatística. Ao inverter temporalmente um processo termodinâmico de dispersão browniana, a rede neural aprende a reconstruir a densidade de probabilidade de dados complexos.`,
    tags: ['difusão', 'termodinâmica', 'ia-generativa', 'estatística'],
    reactions: { '💡': 69, '🔬': 30, '🔗': 52, '❓': 8, '🤔': 1, '❤️': 41 },
    annotations: [],
    views: 2210,
    saves: 560,
    createdAt: '2026-10-17'
  },
  {
    id: 'comp-3',
    title: 'Algoritmos Quânticos Variacionais (VQE) em Hardware Ruidoso (NISQ)',
    slug: 'algoritmos-quanticos-variacionais-vqe-nisq',
    author: {
      name: 'Dra. Tatiana Becker',
      role: 'Engenheira de Computação Quântica',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      reputation: 91
    },
    area: 'Computação',
    subtopic: 'Computação Quântica',
    type: 'Resultado',
    excerpt: 'Otimização híbrida quântico-clássica para cálculo de estados fundamentais em química quântica.',
    content: `Enquanto computadores quânticos tolerantes a falhas universais com milhões de qubits lógicos não chegam, algoritmos híbridos como VQE transferem grande parte da otimização para nós de CPU clássica, utilizando os processadores quânticos apenas para gerar e medir estados de superposição intrincada.`,
    tags: ['computação-quântica', 'vqe', 'algoritmos', 'hardware'],
    reactions: { '💡': 53, '🔬': 35, '🔗': 37, '❓': 10, '🤔': 4, '❤️': 26 },
    annotations: [],
    views: 1640,
    saves: 370,
    createdAt: '2026-10-19'
  },
  {
    id: 'comp-4',
    title: 'Consenso Bizantino e Teoria dos Jogos em Sistemas Distribuídos',
    slug: 'consenso-bizantino-teoria-jogos-redes',
    author: {
      name: 'Felipe Fontana',
      role: 'Arquiteto de Sistemas Distribuídos',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      reputation: 84
    },
    area: 'Computação',
    subtopic: 'Sistemas Distribuídos',
    type: 'Ideia',
    excerpt: 'Garantindo consistência em redes descentralizadas peer-to-peer sob adversários ativos.',
    content: `O problema dos generais bizantinos demonstra que nós que transmitem informações inconsistentes ou maliciosas impedem o consenso clássico sem limites estritos de assinaturas digitais ou incentivos de teoria dos jogos que tornem o comportamento cooperativo um equilíbrio de Nash.`,
    tags: ['sistemas-distribuídos', 'consenso', 'teoria-dos-jogos', 'p2p'],
    reactions: { '💡': 44, '🔬': 16, '🔗': 29, '❓': 6, '🤔': 2, '❤️': 21 },
    annotations: [],
    views: 1250,
    saves: 270,
    createdAt: '2026-10-16'
  },
  {
    id: 'comp-5',
    title: 'Transparência Mecanística e Desemaranhamento de Conceitos em LLMs',
    slug: 'interpretabilidade-mecanistica-llms',
    author: {
      name: 'Sofia Aragão',
      role: 'Pesquisadora de Alinhamento e Interpretabilidade',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
      reputation: 94
    },
    area: 'Computação',
    subtopic: 'Alinhamento & Interpretabilidade',
    type: 'Descoberta',
    excerpt: 'Autoencoders esparsos (SAEs) decompõem ativações de neurônios polissêmicos em características legíveis por humanos.',
    content: `Modelos de linguagem empilham centenas de conceitos em vetores de representação densa por superposição. Ao treinar autoencoders com regularização L1 estrita nas camadas residuais, conseguimos isolar direções semânticas únicas, revelando circuitos lógicos internos e circuitos de raciocínio passo a passo.`,
    tags: ['interpretabilidade', 'autoencoders', 'llm', 'alinhamento'],
    reactions: { '💡': 92, '🔬': 48, '🔗': 71, '❓': 11, '🤔': 5, '❤️': 56 },
    annotations: [],
    views: 3400,
    saves: 920,
    createdAt: '2026-10-21'
  },

  // --- HUMANIDADES ---
  {
    id: 'hum-1',
    title: 'A Filosofia da Mente e a Questão da Consciência Artificial',
    slug: 'filosofia-mente-consciencia-artificial',
    author: {
      name: 'Profa. Laura Mendonça',
      role: 'Filósofa da Ciência / USP',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      reputation: 95
    },
    area: 'Humanidades',
    subtopic: 'Filosofia da Mente',
    type: 'Discussão',
    excerpt: 'O argumento do Quarto Chinês de Searle revisitado à luz de grandes modelos fundacionais contemporâneos.',
    content: `Manipulação sintática de símbolos formais gera semântica genuína ou apenas simulação comportamental convincente? Quando uma rede neural prevê a próxima palavra combinando bilhões de pesos ponderados, o problema difícil da consciência (Chalmers) e a natureza dos qualia permanecem irredutíveis a funções de custo puramente empíricas.`,
    tags: ['filosofia', 'consciência', 'qualia', 'epistemologia', 'ia'],
    reactions: { '💡': 89, '🔬': 32, '🔗': 66, '❓': 21, '🤔': 14, '❤️': 62 },
    annotations: [
      {
        id: 'ann-4',
        selectedText: 'Manipulação sintática de símbolos formais gera semântica genuína ou apenas simulação comportamental convincente?',
        highlightCount: 52,
        commentsCount: 15,
        notes: [
          {
            id: 'n4',
            author: 'Sofia Aragão',
            text: 'Pesquisas recentes de circuitos de representação sugerem que o modelo constrói mundos conceituais internos, não apenas estatística superficial!',
            createdAt: '2 dias atrás'
          }
        ]
      }
    ],
    views: 3120,
    saves: 850,
    createdAt: '2026-10-15'
  },
  {
    id: 'hum-2',
    title: 'Estruturas de Revoluções Científicas e Mudanças de Paradigma',
    slug: 'revolucoes-cientificas-thomas-kuhn-paradigmas',
    author: {
      name: 'Dr. Valter Queiroz',
      role: 'Epistemólogo & Historiador da Ciência',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
      reputation: 90
    },
    area: 'Humanidades',
    subtopic: 'Epistemologia',
    type: 'Explicação',
    excerpt: 'Como o acúmulo de anomalias empíricas força a transição de períodos de ciência normal para rupturas revolucionárias.',
    content: `Thomas Kuhn postulou que o conhecimento científico não avança por acumulação linear e cumulativa, mas através de crises conceituais onde um paradigma dominante é substituído. O mapeamento contemporâneo de redes de citações interdisciplinares revela exatamente onde novas rupturas de fronteira estão se formando.`,
    tags: ['kuhn', 'epistemologia', 'paradigmas', 'história-da-ciência'],
    reactions: { '💡': 61, '🔬': 19, '🔗': 48, '❓': 5, '🤔': 3, '❤️': 37 },
    annotations: [],
    views: 1950,
    saves: 430,
    createdAt: '2026-10-17'
  },
  {
    id: 'hum-3',
    title: 'Linguística Computacional e a Hipótese de Sapir-Whorf Digital',
    slug: 'linguistica-computacional-sapir-whorf-digital',
    author: {
      name: 'Heloísa Castro',
      role: 'Linguista Cognitiva',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      reputation: 86
    },
    area: 'Humanidades',
    subtopic: 'Linguística',
    type: 'Hipótese',
    excerpt: 'As estruturas sintáticas dos algoritmos e prompts moldam o próprio horizonte cognitivo do pensamento humano?',
    content: `A hipótese do determinismo linguístico afirmava que a língua que falamos condiciona a nossa percepção da realidade. Na era dos agentes autônomos, questionamos como interfaces textuais sintetizadas retroalimentam e estreitam o repertório discursivo dos próprios pesquisadores.`,
    tags: ['linguística', 'sapir-whorf', 'cognição', 'linguagem'],
    reactions: { '💡': 46, '🔬': 14, '🔗': 31, '❓': 8, '🤔': 5, '❤️': 25 },
    annotations: [],
    views: 1410,
    saves: 310,
    createdAt: '2026-10-18'
  },
  {
    id: 'hum-4',
    title: 'Ética Algorítmica e a Construção Coletiva de Justiça Social',
    slug: 'etica-algoritmica-justica-social-vies',
    author: {
      name: 'Rodrigo Siqueira',
      role: 'Sociólogo da Tecnologia',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
      reputation: 88
    },
    area: 'Humanidades',
    subtopic: 'Sociologia da Tecnologia',
    type: 'Ideia',
    excerpt: 'Vieses históricos embutidos em conjuntos de treinamento automatizam assimetrias de poder se não auditados criticamente.',
    content: `Algoritmos preditivos não operam em um vácuo neutro: ao refletirem a distribuição estatística de dados do passado, eles tendem a codificar e amplificar desigualdades estruturais. A auditoria aberta e colaborativa é um imperativo civilizatório.`,
    tags: ['ética', 'vieses', 'sociologia', 'justiça-algorítmica'],
    reactions: { '💡': 57, '🔬': 23, '🔗': 40, '❓': 9, '🤔': 6, '❤️': 44 },
    annotations: [],
    views: 1820,
    saves: 410,
    createdAt: '2026-10-19'
  },
  {
    id: 'hum-5',
    title: 'A Poética do Conhecimento: Narrativa e Curiosidade na Ciência',
    slug: 'poetica-do-conhecimento-narrativa-curiosidade',
    author: {
      name: 'Dr. Thiago Vasconcellos',
      role: 'Escritor & Historiador',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
      reputation: 92
    },
    area: 'Humanidades',
    subtopic: 'História das Ideias',
    type: 'Artigo',
    excerpt: 'A ciência como uma grande narrativa aberta, onde metáforas fecundas abrem caminhos para novas deduções empíricas.',
    content: `Grandes saltos científicos raramente nasceram de cálculos frios isolados: nasceram de intuições metafóricas vivas — o relógio mecanicista de Newton, o trem em movimento de Einstein, a serpente enrolada de Kekulé. A imaginação narrativa é o motor da dedução racional.`,
    tags: ['narrativa', 'curiosidade', 'história-das-ideias', 'criatividade'],
    reactions: { '💡': 78, '🔬': 22, '🔗': 51, '❓': 3, '🤔': 1, '❤️': 69 },
    annotations: [],
    views: 2400,
    saves: 670,
    createdAt: '2026-10-20'
  }
];

export const INITIAL_CONNECTIONS: PublicationConnection[] = [
  // --- Conexões Interdisciplinares Fortes (Pontes entre Mundos) ---
  {
    id: 'conn-1',
    source: 'bio-1', // Plasticidade sináptica (Biologia)
    target: 'comp-5', // LLMs & Mecanismos Neurais (Computação)
    type: 'inspira',
    isInterdisciplinary: true,
    activityCount: 42
  },
  {
    id: 'conn-2',
    source: 'bio-1', // Plasticidade sináptica (Biologia)
    target: 'fis-1', // Criticalidade auto-organizada (Física)
    type: 'possui evidência para',
    isInterdisciplinary: true,
    activityCount: 56
  },
  {
    id: 'conn-3',
    source: 'fis-1', // Criticalidade (Física)
    target: 'mat-3', // Sistemas Dinâmicos & Caos (Matemática)
    type: 'utiliza método de',
    isInterdisciplinary: true,
    activityCount: 38
  },
  {
    id: 'conn-4',
    source: 'fis-3', // Termodinâmica da Informação (Física)
    target: 'mat-4', // Teoria da Informação de Shannon (Matemática)
    type: 'explica',
    isInterdisciplinary: true,
    activityCount: 65
  },
  {
    id: 'conn-5',
    source: 'comp-1', // Redes GNN (Computação)
    target: 'mat-1', // Teoria Espectral de Grafos (Matemática)
    type: 'deriva de',
    isInterdisciplinary: true,
    activityCount: 71
  },
  {
    id: 'conn-6',
    source: 'comp-1', // Redes GNN (Computação)
    target: 'qui-3', // Modelagem MOFs (Química)
    type: 'aplica',
    isInterdisciplinary: true,
    activityCount: 60
  },
  {
    id: 'conn-7',
    source: 'comp-2', // Modelos de Difusão (Computação)
    target: 'fis-1', // Mecânica Estatística (Física)
    type: 'deriva de',
    isInterdisciplinary: true,
    activityCount: 49
  },
  {
    id: 'conn-8',
    source: 'hum-1', // Filosofia da Mente (Humanidades)
    target: 'comp-5', // Interpretabilidade LLMs (Computação)
    type: 'pergunta',
    isInterdisciplinary: true,
    activityCount: 88
  },
  {
    id: 'conn-9',
    source: 'hum-1', // Filosofia da Mente (Humanidades)
    target: 'bio-1', // Neurociência (Biologia)
    type: 'relacionado a',
    isInterdisciplinary: true,
    activityCount: 53
  },
  {
    id: 'conn-10',
    source: 'qui-4', // Astroquímica (Química)
    target: 'fis-2', // Física Quântica / Tunelamento (Física)
    type: 'aplica',
    isInterdisciplinary: true,
    activityCount: 35
  },
  {
    id: 'conn-11',
    source: 'mat-2', // TDA Topologia (Matemática)
    target: 'bio-2', // Redes Genéticas (Biologia)
    type: 'aplica',
    isInterdisciplinary: true,
    activityCount: 44
  },
  {
    id: 'conn-12',
    source: 'hum-2', // Revoluções Científicas (Humanidades)
    target: 'mat-1', // Grafos de Citações (Matemática)
    type: 'utiliza método de',
    isInterdisciplinary: true,
    activityCount: 39
  },
  {
    id: 'conn-13',
    source: 'comp-3', // Algoritmos Quânticos VQE (Computação)
    target: 'fis-2', // Fases Quânticas (Física)
    type: 'utiliza método de',
    isInterdisciplinary: true,
    activityCount: 48
  },
  {
    id: 'conn-14',
    source: 'hum-4', // Ética Algorítmica (Humanidades)
    target: 'comp-4', // Consenso & Teoria dos Jogos (Computação)
    type: 'complementa',
    isInterdisciplinary: true,
    activityCount: 34
  },
  {
    id: 'conn-15',
    source: 'bio-3', // Portas Lógicas Sintéticas (Biologia)
    target: 'comp-4', // Sistemas Distribuídos (Computação)
    type: 'aplica',
    isInterdisciplinary: true,
    activityCount: 32
  },

  // --- Conexões Intra-área (Clusters Orgânicos) ---
  {
    id: 'conn-16',
    source: 'bio-1',
    target: 'bio-2',
    type: 'complementa',
    isInterdisciplinary: false,
    activityCount: 22
  },
  {
    id: 'conn-17',
    source: 'bio-2',
    target: 'bio-3',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 19
  },
  {
    id: 'conn-18',
    source: 'bio-4',
    target: 'bio-1',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 15
  },
  {
    id: 'conn-19',
    source: 'bio-5',
    target: 'bio-3',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 20
  },
  {
    id: 'conn-20',
    source: 'qui-1',
    target: 'qui-3',
    type: 'complementa',
    isInterdisciplinary: false,
    activityCount: 25
  },
  {
    id: 'conn-21',
    source: 'qui-2',
    target: 'qui-5',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 18
  },
  {
    id: 'conn-22',
    source: 'fis-1',
    target: 'fis-3',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 31
  },
  {
    id: 'conn-23',
    source: 'fis-2',
    target: 'fis-5',
    type: 'complementa',
    isInterdisciplinary: false,
    activityCount: 27
  },
  {
    id: 'conn-24',
    source: 'mat-1',
    target: 'mat-2',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 36
  },
  {
    id: 'conn-25',
    source: 'mat-4',
    target: 'mat-5',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 28
  },
  {
    id: 'conn-26',
    source: 'comp-1',
    target: 'comp-5',
    type: 'complementa',
    isInterdisciplinary: false,
    activityCount: 45
  },
  {
    id: 'conn-27',
    source: 'comp-2',
    target: 'comp-5',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 38
  },
  {
    id: 'conn-28',
    source: 'hum-1',
    target: 'hum-3',
    type: 'relacionado a',
    isInterdisciplinary: false,
    activityCount: 33
  },
  {
    id: 'conn-29',
    source: 'hum-2',
    target: 'hum-5',
    type: 'inspira',
    isInterdisciplinary: false,
    activityCount: 29
  },
  {
    id: 'conn-30',
    source: 'hum-4',
    target: 'hum-1',
    type: 'pergunta',
    isInterdisciplinary: false,
    activityCount: 30
  }
];
