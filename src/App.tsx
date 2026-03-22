import { useState, useCallback } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ReviewScreen } from './components/ReviewScreen';
import type { GameConfig } from './types';
import wordListData from '../word_list.json';
import './App.css';

type Screen = 'setup' | 'game' | 'review';

function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [revealedCharacters, setRevealedCharacters] = useState<string[]>([]);

  const handleStartGame = useCallback((config: GameConfig) => {
    setGameConfig(config);
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  const handleEndGame = useCallback((revealed: string[]) => {
    setRevealedCharacters(revealed);
    setScreen('review');
  }, []);

  const handleQuickRestart = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  const handleNewGame = useCallback(() => {
    setGameConfig(null);
    setScreen('setup');
  }, []);

  return (
    <div className="app">
      {screen === 'setup' && (
        <SetupScreen wordList={wordListData} onStartGame={handleStartGame} />
      )}
      {screen === 'game' && gameConfig && (
        <GameScreen
          key={gameKey}
          config={gameConfig}
          onEndGame={handleEndGame}
        />
      )}
      {screen === 'review' && (
        <ReviewScreen
          revealedCharacters={revealedCharacters}
          onQuickRestart={handleQuickRestart}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}

export default App;
