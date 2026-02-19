import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from '../game/config';
import { EventBus, GameEvents } from '../game/utils/EventBus';

export interface PlayerStateData {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  score: number;
  survivalTime: number;
  wave: number;
  monstersKilled: number;
}

export interface LevelUpData {
  level: number;
  upgrades: Array<{
    type: 'weapon' | 'passive';
    id: string;
    name: string;
    nameKo: string;
    description: string;
    descriptionKo: string;
    currentLevel: number;
    maxLevel: number;
    isNew: boolean;
    isEvolution?: boolean;
  }>;
}

export function usePhaser(containerId: string) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerStateData | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Create game instance
    const config = createPhaserConfig(containerId);
    gameRef.current = new Phaser.Game(config);

    // Setup event listeners
    const handleGameReady = () => {
      setIsReady(true);
    };

    const handlePlayerState = (data: PlayerStateData) => {
      setPlayerState(data);
    };

    const handleLevelUp = (data: LevelUpData) => {
      setLevelUpData(data);
    };

    const handleGameOver = () => {
      setIsGameOver(true);
    };

    EventBus.on(GameEvents.GAME_READY, handleGameReady);
    EventBus.on(GameEvents.PLAYER_STATE_UPDATE, handlePlayerState);
    EventBus.on(GameEvents.LEVEL_UP, handleLevelUp);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);

    return () => {
      EventBus.off(GameEvents.GAME_READY, handleGameReady);
      EventBus.off(GameEvents.PLAYER_STATE_UPDATE, handlePlayerState);
      EventBus.off(GameEvents.LEVEL_UP, handleLevelUp);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [containerId]);

  const selectUpgrade = (type: string, id: string) => {
    EventBus.emit(GameEvents.UPGRADE_SELECTED, { type, id });
    setLevelUpData(null);
  };

  const pauseGame = () => {
    EventBus.emit(GameEvents.PAUSE_GAME);
  };

  const resumeGame = () => {
    EventBus.emit(GameEvents.RESUME_GAME);
  };

  const restartGame = () => {
    setIsGameOver(false);
    setPlayerState(null);
    setLevelUpData(null);
    EventBus.emit(GameEvents.GAME_START);
  };

  const sendJoystickInput = (x: number, y: number) => {
    EventBus.emit('joystick-move', { x, y });
  };

  return {
    game: gameRef.current,
    isReady,
    playerState,
    levelUpData,
    isGameOver,
    selectUpgrade,
    pauseGame,
    resumeGame,
    restartGame,
    sendJoystickInput,
  };
}
