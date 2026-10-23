import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  Sparkles, 
  Highlighter, 
  Send,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useContentStore } from '../store/contentStore';
import { useMapStore } from '../store/mapStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { SemanticReaction } from '../types';

export const ReadingDrawer: React.FC = () => {
  const { 
    selectedNodeId, 
    setSelectedNodeId, 
    nodes, 
    connections, 
    addReaction,
    addAnnotation,
    addCommentToAnnotation
  } = useContentStore();

  const { focusOnCoordinates } = useMapStore();

  const [commentText, setCommentText] = useState('');
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const areaTheme = SCIENTIFIC_AREAS[node.area];

  // Encontra nós conectados a este (Portas para outras ideias)
  const relatedConnections = connections.filter(
    (c) => c.source === node.id || c.target === node.id
  );

  const connectedNodes = relatedConnections.map((c) => {
    const targetId = c.source === node.id ? c.target : c.source;
    const targetNode = nodes.find((n) => n.id === targetId);
    return {
      connection: c,
      targetNode
    };
  }).filter((item) => item.targetNode !== undefined);

  // Lista de reações semânticas
  const reactionsList: { emoji: SemanticReaction; label: string }[] = [
    { emoji: '💡', label: 'Interessante' },
    { emoji: '❓', label: 'Dúvida' },
    { emoji: '🔬', label: 'Investigar' },
    { emoji: '🔗', label: 'Boa Conexão' },
    { emoji: '🤔', label: 'Discordo' },
    { emoji: '❤️', label: 'Inspirador' }
  ];

  // Lógica de seleção de texto para anotação / heatmap
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length > 5 && text.length < 300) {
      addAnnotation(node.id, {
        selectedText: text,
        highlightCount: 1,
        commentsCount: 0,
        notes: []
      });
      selection.removeAllRanges();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[620px] bg-white dark:bg-[#0E131F] border-l border-stone-200 dark:border-stone-800 shadow-2xl z-50 flex flex-col transition-transform select-text">
      {/* Header do Drawer */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-[#0B0F17]/80 backdrop-blur-md select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${areaTheme.accentColor}20`,
              color: areaTheme.accentColor
            }}
          >
            {node.area}
          </span>
          <span className="text-xs font-mono text-stone-400">
            {node.subtopic}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Corpo da Leitura (Nível 3 Focado) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metadados do Autor */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/80 select-none">
          <div className="flex items-center gap-3">
            <img
              src={node.author.avatar}
              alt={node.author.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-stone-200 dark:ring-stone-700"
            />
            <div>
              <h5 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                {node.author.name}
              </h5>
              <p className="text-xs text-stone-500">
                {node.author.role}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {node.createdAt}
          </span>
        </div>

        {/* Título Editorial Principal */}
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
          {node.title}
        </h1>

        {/* Resumo em Destaque */}
        <p className="text-sm font-editorial italic text-stone-600 dark:text-stone-300 border-l-2 border-indigo-500 pl-3.5 py-0.5 leading-relaxed">
          {node.excerpt}
        </p>

        {/* Texto do Artigo com Heatmap Coletivo de Destaque */}
        <div 
          onMouseUp={handleTextSelect}
          className="prose dark:prose-invert prose-stone max-w-none text-sm sm:text-base leading-relaxed space-y-4 font-sans text-stone-800 dark:text-stone-200"
        >
          {node.content.split('\n\n').map((paragraph, idx) => {
            // Verifica se algum trecho anotado está neste parágrafo
            return (
              <p key={idx} className="relative">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Dica de Heatmap */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 flex items-center gap-2.5 text-xs text-stone-500 select-none">
          <Highlighter className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Heatmap Coletivo:</strong> Selecione qualquer trecho do texto com o mouse para destacar ou comentar em colaboração com a comunidade.
          </span>
        </div>

        {/* Anotações e Discussões do Post */}
        {node.annotations.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800 select-none">
            <h4 className="text-xs font-mono uppercase text-stone-400 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Anotações da Comunidade ({node.annotations.length})
            </h4>

            {node.annotations.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                  <span>Destacado por {ann.highlightCount} pesquisadores</span>
                </div>
                <p className="font-editorial italic text-stone-800 dark:text-stone-200">
                  "{ann.selectedText}"
                </p>

                {/* Comentários da anotação */}
                {ann.notes.map((note) => (
                  <div key={note.id} className="pt-2 border-t border-amber-500/15">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {note.author}:
                    </span>{' '}
                    <span className="text-stone-600 dark:text-stone-400">
                      {note.text}
                    </span>
                  </div>
                ))}

                {/* Input de réplica */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={activeAnnotationId === ann.id ? commentText : ''}
                    onFocus={() => setActiveAnnotationId(ann.id)}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicionar nota a este trecho..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!commentText.trim()) return;
                      addCommentToAnnotation(node.id, ann.id, commentText, 'Você');
                      setCommentText('');
                    }}
                    className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mini-Mapa Orbital: Portas para Outras Ideias */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3 select-none">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase text-indigo-500 font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Portas para Outras Ideias ({connectedNodes.length})
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              Clique para viajar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {connectedNodes.map(({ connection, targetNode }) => {
              if (!targetNode) return null;
              const targetTheme = SCIENTIFIC_AREAS[targetNode.area];

              return (
                <button
                  key={targetNode.id}
                  onClick={() => {
                    setSelectedNodeId(targetNode.id);
                    if (targetNode.x !== undefined && targetNode.y !== undefined) {
                      focusOnCoordinates(targetNode.x, targetNode.y, 1.3);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left group"
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span
                      className="font-bold uppercase tracking-wider px-1 rounded"
                      style={{
                        backgroundColor: `${targetTheme.accentColor}15`,
                        color: targetTheme.accentColor
                      }}
                    >
                      {targetNode.area}
                    </span>
                    <span className="font-mono text-stone-400">
                      {connection.type} →
                    </span>
                  </div>
                  <h6 className="font-editorial text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-indigo-400 line-clamp-1">
                    {targetNode.title}
                  </h6>
                </button>
              );
            })}
          </div>
        </div>

        {/* Referências Científicas */}
        {node.references && node.references.length > 0 && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 select-none">
            <h4 className="text-xs font-mono uppercase text-stone-400 mb-2">
              Fontes Primárias Citadas
            </h4>
            <div className="space-y-1.5">
              {node.references.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/30 border border-stone-200/50 dark:border-stone-800 text-xs"
                >
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {ref.title}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {ref.authors} ({ref.year}) {ref.doi && `• DOI: ${ref.doi}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer com Reações Semânticas */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-[#0B0F17]/90 backdrop-blur-md flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          {reactionsList.map((r) => {
            const count = node.reactions[r.emoji] || 0;
            const isUserSelected = node.userReaction === r.emoji;

            return (
              <button
                key={r.emoji}
                onClick={() => addReaction(node.id, r.emoji)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                  isUserSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
                title={r.label}
              >
                <span>{r.emoji}</span>
                <span className="font-mono text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
