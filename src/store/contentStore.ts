import { create } from 'zustand';
import { PublicationNode, PublicationConnection, ScientificArea, SemanticReaction, PostAnnotation, ConnectionType } from '../types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from '../data/mockNodes';

interface ContentState {
  nodes: PublicationNode[];
  connections: PublicationConnection[];
  selectedNodeId: string | null;
  activeAreaFilter: ScientificArea | null;
  searchQuery: string;
  focusMode: boolean; // Modo Foco / Trilha Pessoal
  explorationTrail: string[]; // IDs dos nós visitados em ordem cronológica
  
  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setActiveAreaFilter: (area: ScientificArea | null) => void;
  setSearchQuery: (query: string) => void;
  toggleFocusMode: () => void;
  
  // Interações
  addReaction: (nodeId: string, reaction: SemanticReaction) => void;
  addAnnotation: (nodeId: string, annotation: Omit<PostAnnotation, 'id'>) => void;
  addCommentToAnnotation: (nodeId: string, annotationId: string, text: string, authorName: string) => void;
  
  // Publicação de novo nó
  createNode: (newNode: Omit<PublicationNode, 'id' | 'slug' | 'reactions' | 'annotations' | 'views' | 'saves' | 'createdAt'>, targetConnection?: { targetId: string; type: ConnectionType }) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  nodes: INITIAL_NODES,
  connections: INITIAL_CONNECTIONS,
  selectedNodeId: null,
  activeAreaFilter: null,
  searchQuery: '',
  focusMode: false,
  explorationTrail: [],

  setSelectedNodeId: (id) => {
    set((state) => {
      if (!id) return { selectedNodeId: null };
      
      const newTrail = state.explorationTrail.includes(id)
        ? state.explorationTrail
        : [...state.explorationTrail, id];

      // Aumenta visualização
      const updatedNodes = state.nodes.map((n) =>
        n.id === id ? { ...n, views: n.views + 1 } : n
      );

      return {
        selectedNodeId: id,
        explorationTrail: newTrail,
        nodes: updatedNodes
      };
    });
  },

  setActiveAreaFilter: (area) => set({ activeAreaFilter: area }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),

  addReaction: (nodeId, reaction) => {
    set((state) => {
      const updatedNodes = state.nodes.map((n) => {
        if (n.id !== nodeId) return n;

        const currentReactions = { ...n.reactions };
        let userReaction = n.userReaction;

        if (userReaction === reaction) {
          // Desmarcar reação
          currentReactions[reaction] = Math.max(0, currentReactions[reaction] - 1);
          userReaction = undefined;
        } else {
          // Se já tinha outra, decrementa ela
          if (userReaction) {
            currentReactions[userReaction] = Math.max(0, currentReactions[userReaction] - 1);
          }
          currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;
          userReaction = reaction;
        }

        return {
          ...n,
          reactions: currentReactions,
          userReaction
        };
      });

      return { nodes: updatedNodes };
    });
  },

  addAnnotation: (nodeId, annotationData) => {
    set((state) => {
      const newAnn: PostAnnotation = {
        id: `ann-${Date.now()}`,
        ...annotationData
      };

      const updatedNodes = state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          annotations: [...n.annotations, newAnn]
        };
      });

      return { nodes: updatedNodes };
    });
  },

  addCommentToAnnotation: (nodeId, annotationId, text, authorName) => {
    set((state) => {
      const updatedNodes = state.nodes.map((n) => {
        if (n.id !== nodeId) return n;

        const updatedAnnotations = n.annotations.map((ann) => {
          if (ann.id !== annotationId) return ann;
          return {
            ...ann,
            commentsCount: ann.commentsCount + 1,
            notes: [
              ...ann.notes,
              {
                id: `note-${Date.now()}`,
                author: authorName || 'Pesquisador Visitante',
                text,
                createdAt: 'Agora mesmo'
              }
            ]
          };
        });

        return {
          ...n,
          annotations: updatedAnnotations
        };
      });

      return { nodes: updatedNodes };
    });
  },

  createNode: (nodeData, targetConnection) => {
    const id = `node-${Date.now()}`;
    const slug = nodeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newNode: PublicationNode = {
      ...nodeData,
      id,
      slug,
      reactions: { '💡': 1, '🔬': 0, '🔗': 1, '❓': 0, '🤔': 0, '❤️': 0 },
      annotations: [],
      views: 1,
      saves: 0,
      createdAt: 'Hoje',
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200
    };

    set((state) => {
      const newNodes = [newNode, ...state.nodes];
      let newConnections = [...state.connections];

      if (targetConnection && targetConnection.targetId) {
        const targetNode = state.nodes.find((n) => n.id === targetConnection.targetId);
        const isInterdisciplinary = targetNode ? targetNode.area !== newNode.area : false;

        const newConn: PublicationConnection = {
          id: `conn-${Date.now()}`,
          source: id,
          target: targetConnection.targetId,
          type: targetConnection.type,
          isInterdisciplinary,
          activityCount: 1
        };

        newConnections.push(newConn);
      }

      return {
        nodes: newNodes,
        connections: newConnections,
        selectedNodeId: id,
        explorationTrail: [...state.explorationTrail, id]
      };
    });
  }
}));
