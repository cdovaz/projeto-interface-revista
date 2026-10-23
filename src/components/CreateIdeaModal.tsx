import React, { useState } from 'react';
import { X, Sparkles, Link2 } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useContentStore } from '../store/contentStore';
import { SCIENTIFIC_AREAS } from '../data/areas';
import { ScientificArea, PostType, ConnectionType } from '../types';

export const CreateIdeaModal: React.FC = () => {
  const { createModalOpen, setCreateModalOpen } = useMapStore();
  const { createNode, nodes } = useContentStore();

  const [title, setTitle] = useState('');
  const [area, setArea] = useState<ScientificArea>('Computação');
  const [subtopic, setSubtopic] = useState('');
  const [type, setType] = useState<PostType>('Ideia');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('relacionado a');

  if (!createModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNode(
      {
        title,
        area,
        subtopic: subtopic || area,
        type,
        excerpt: excerpt || content.slice(0, 120) + '...',
        content,
        tags: [area.toLowerCase(), type.toLowerCase()],
        author: {
          name: 'Daniel Ventura',
          role: 'Pesquisador Visitante',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          reputation: 100
        }
      },
      targetId ? { targetId, type: connectionType } : undefined
    );

    // Fecha o modal e limpa o formulário
    setCreateModalOpen(false);
    setTitle('');
    setContent('');
    setExcerpt('');
    setTargetId('');
  };

  const areasList = Object.keys(SCIENTIFIC_AREAS) as ScientificArea[];
  const postTypes: PostType[] = [
    'Ideia',
    'Pergunta',
    'Hipótese',
    'Projeto',
    'Resultado',
    'Experiência',
    'Explicação',
    'Descoberta'
  ];

  const connectionTypes: ConnectionType[] = [
    'relacionado a',
    'deriva de',
    'contradiz',
    'aplica',
    'explica',
    'inspira',
    'complementa'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl bg-white dark:bg-[#0E131F] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-[#0B0F17]/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100">
                Lançar Nova Ideia no Mapa
              </h3>
              <p className="text-[11px] text-stone-400">
                Cada publicação se conecta à rede coletiva do conhecimento
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(false)}
            className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Título da Ideia ou Pergunta
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como a entropia de Shannon se relaciona com criticalidade neural?"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Região / Área Principal
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as ScientificArea)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                {areasList.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Tipo de Contribuição
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PostType)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                {postTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Subtópico ou Tema
            </label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="Ex: Redes Complexas, Biofísica, Termodinâmica..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          {/* Conexão com Nó Existente */}
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <span className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
              <Link2 className="w-3.5 h-3.5" /> A qual ideia existente isso se conecta? (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none text-[11px]"
              >
                <option value="">Nenhuma (criar nó isolado)</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [{n.area}] {n.title.slice(0, 35)}...
                  </option>
                ))}
              </select>

              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none text-[11px]"
              >
                {connectionTypes.map((c) => (
                  <option key={c} value={c}>
                    Vínculo: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
              Texto Completo do Artigo / Ideia
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Desenvolva sua hipótese, argumento ou resultado em detalhes..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
            >
              Publicar no Mapa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
