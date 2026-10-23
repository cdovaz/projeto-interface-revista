import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { KnowledgeMap } from './components/KnowledgeMap';
import { ProfileScreen } from './components/ProfileScreen';
import { ReadingDrawer } from './components/ReadingDrawer';
import { CreateIdeaModal } from './components/CreateIdeaModal';
import { MapControls } from './components/MapControls';
import { useMapStore } from './store/mapStore';

export function App() {
  const { theme, activeScreen } = useMapStore();

  useEffect(() => {
    // Garante sincronização de tema no DOM element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="w-screen h-screen flex flex-col bg-stone-100 dark:bg-[#070A10] text-stone-900 dark:text-stone-100 overflow-hidden font-sans">
      {/* 1. Cabeçalho Superior com Busca, Controles e Nova Ideia */}
      <Header />

      {/* 2. Área Central com Barras Laterais e Conteúdo Dinâmico */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Barra Lateral Esquerda: Navegar, Perfil, Meus Posts, Configurações */}
        <LeftSidebar />

        {/* Centro: Alterna entre o Mapa Vivo (Navegar) e a Tela de Perfil */}
        <div className="flex-1 relative h-full flex overflow-hidden">
          {activeScreen === 'perfil' ? (
            <ProfileScreen />
          ) : (
            <div className="flex-1 relative h-full">
              <KnowledgeMap />
              <MapControls />
            </div>
          )}
        </div>

        {/* Barra Lateral Direita: Destaques da Semana (exclusiva da tela Navegar) */}
        {activeScreen === 'navegar' && <RightSidebar />}

        {/* Drawer Lateral de Leitura Focada (Nível 3) */}
        <ReadingDrawer />
      </main>

      {/* Modal de Publicação de Nova Ideia & Conexão */}
      <CreateIdeaModal />
    </div>
  );
}

export default App;
