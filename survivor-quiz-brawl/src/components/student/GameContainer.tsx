import React, { useEffect, useRef, useState } from 'react';
import { usePhaser } from '../../hooks/usePhaser';
import { QuizOverlay } from './QuizOverlay';
import { UpgradeSelect } from './UpgradeSelect';
import { GameHUD } from './GameHUD';
import { MobileControls } from './MobileControls';
import { useQuizStore } from '../../stores/quizStore';

interface GameContainerProps {
  playerName: string;
  onGameOver?: (data: { score: number; level: number; survivalTime: number }) => void;
}

export function GameContainer({ playerName, onGameOver }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    isReady,
    playerState,
    levelUpData,
    isGameOver,
    selectUpgrade,
    pauseGame,
    resumeGame,
    sendJoystickInput,
  } = usePhaser('game-container');

  const { getCurrentQuiz, submitAnswer, nextQuiz } = useQuizStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isGameOver && playerState && onGameOver) {
      onGameOver({
        score: playerState.score,
        level: playerState.level,
        survivalTime: playerState.survivalTime,
      });
    }
  }, [isGameOver, playerState, onGameOver]);

  const handleLevelUp = () => {
    // Check if we should show a quiz
    const quiz = getCurrentQuiz();
    if (quiz && playerState && playerState.level % 3 === 0) {
      setShowQuiz(true);
      pauseGame();
    }
  };

  useEffect(() => {
    if (levelUpData) {
      handleLevelUp();
    }
  }, [levelUpData]);

  const handleQuizAnswer = (selectedIndex: number, isCorrect: boolean) => {
    submitAnswer(selectedIndex, 0);
    setShowQuiz(false);

    if (isCorrect) {
      // Bonus: show all upgrades
    }

    // Continue to upgrade selection
  };

  const handleUpgradeSelect = (type: string, id: string) => {
    selectUpgrade(type, id);
  };

  const handleJoystickMove = (x: number, y: number) => {
    sendJoystickInput(x, y);
  };

  return (
    <div className="relative w-full h-full bg-pixel-dark overflow-hidden">
      {/* Game Canvas */}
      <div
        id="game-container"
        ref={containerRef}
        className="w-full h-full"
      />

      {/* HUD Overlay */}
      {isReady && playerState && (
        <GameHUD />
      )}

      {/* Mobile Controls */}
      {isMobile && isReady && !levelUpData && !showQuiz && (
        <MobileControls onMove={handleJoystickMove} />
      )}

      {/* Quiz Overlay */}
      {showQuiz && (
        <QuizOverlay
          quiz={getCurrentQuiz()!}
          timeLimit={15}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Upgrade Selection */}
      {levelUpData && !showQuiz && (
        <UpgradeSelect
          upgrades={levelUpData.upgrades.map((u: any) => ({ ...u, name: u.nameKo || u.name, description: u.descriptionKo || u.description, icon: u.icon || '⚡' }))}
          onSelect={handleUpgradeSelect}
        />
      )}

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-pixel-dark">
          <div className="text-white font-pixel text-xl animate-pulse">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}
