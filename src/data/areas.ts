import { AreaTheme, ScientificArea } from '../types';

export const SCIENTIFIC_AREAS: Record<ScientificArea, AreaTheme> = {
  Biologia: {
    name: 'Biologia',
    label: 'Biologia & Vida',
    accentColor: '#10B981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
    lightBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    darkBg: 'dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
    description: 'Sistemas vivos, evolução, biologia molecular e redes ecológicas.',
    center: { x: -450, y: -250 }
  },
  Química: {
    name: 'Química',
    label: 'Química & Materiais',
    accentColor: '#F59E0B', // Amber
    glowColor: 'rgba(245, 158, 11, 0.4)',
    lightBg: 'bg-amber-50 text-amber-900 border-amber-200',
    darkBg: 'dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    description: 'Síntese molecular, matéria condensada, novos materiais e catálise.',
    center: { x: 0, y: -450 }
  },
  Física: {
    name: 'Física',
    label: 'Física & Cosmos',
    accentColor: '#6366F1', // Indigo
    glowColor: 'rgba(99, 102, 241, 0.4)',
    lightBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    darkBg: 'dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50',
    description: 'Termodinâmica, relatividade, mecânica quântica e criticalidade.',
    center: { x: 450, y: -250 }
  },
  Computação: {
    name: 'Computação',
    label: 'Computação & IA',
    accentColor: '#06B6D4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    lightBg: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    darkBg: 'dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800/50',
    description: 'Algoritmos, redes neurais, arquitetura de sistemas e teoria da computação.',
    center: { x: 450, y: 250 }
  },
  Matemática: {
    name: 'Matemática',
    label: 'Matemática Pura & Aplicada',
    accentColor: '#8B5CF6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.4)',
    lightBg: 'bg-violet-50 text-violet-900 border-violet-200',
    darkBg: 'dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/50',
    description: 'Teoria dos grafos, topologia, sistemas dinâmicos e probabilidade.',
    center: { x: 0, y: 450 }
  },
  Humanidades: {
    name: 'Humanidades',
    label: 'Humanidades & Mente',
    accentColor: '#EC4899', // Pink / Magenta
    glowColor: 'rgba(236, 72, 153, 0.4)',
    lightBg: 'bg-pink-50 text-pink-900 border-pink-200',
    darkBg: 'dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800/50',
    description: 'Epistemologia, filosofia da mente, linguística e sociologia da ciência.',
    center: { x: -450, y: 250 }
  }
};
