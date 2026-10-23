export type ScientificArea = 
  | 'Biologia'
  | 'Química'
  | 'Física'
  | 'Matemática'
  | 'Computação'
  | 'Humanidades';

export type PostType =
  | 'Ideia'
  | 'Pergunta'
  | 'Hipótese'
  | 'Projeto'
  | 'Resultado'
  | 'Experiência'
  | 'Explicação'
  | 'Descoberta'
  | 'Artigo'
  | 'Discussão';

export type ConnectionType =
  | 'relacionado a'
  | 'deriva de'
  | 'contradiz'
  | 'aplica'
  | 'explica'
  | 'complementa'
  | 'pergunta'
  | 'responde'
  | 'inspira'
  | 'utiliza método de'
  | 'possui evidência para';

export type SemanticReaction = '💡' | '❓' | '🔬' | '🔗' | '🤔' | '❤️';

export interface PostAnnotation {
  id: string;
  selectedText: string;
  highlightCount: number;
  commentsCount: number;
  notes: {
    id: string;
    author: string;
    avatar?: string;
    text: string;
    createdAt: string;
  }[];
}

export interface PublicationReference {
  title: string;
  authors: string;
  doi?: string;
  year?: number;
  url?: string;
}

export interface PublicationNode {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    reputation: number;
  };
  area: ScientificArea;
  subtopic: string;
  type: PostType;
  excerpt: string;
  content: string;
  tags: string[];
  references?: PublicationReference[];
  reactions: Record<SemanticReaction, number>;
  userReaction?: SemanticReaction;
  annotations: PostAnnotation[];
  views: number;
  saves: number;
  createdAt: string;
  
  // D3 force simulation internal properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface PublicationConnection {
  id: string;
  source: string; // node id
  target: string; // node id
  type: ConnectionType;
  isInterdisciplinary: boolean;
  activityCount: number;
}

export interface AreaTheme {
  name: ScientificArea;
  label: string;
  accentColor: string;
  glowColor: string;
  lightBg: string;
  darkBg: string;
  description: string;
  center: { x: number; y: number };
}
