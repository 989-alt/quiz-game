import { useEffect, useRef, useState } from 'react';
import { usePhaser } from '../../hooks/usePhaser';
import { QuizOverlay } from './QuizOverlay';
import { UpgradeSelect } from './UpgradeSelect';
import { GameHUD } from './GameHUD';
import { MobileControls } from './MobileControls';
import { useQuizStore } from '../../stores/quizStore';
import { EventBus, GameEvents } from '../../game/utils/EventBus';

interface GameContainerProps {
  playerName: string;
  soloConfig?: { topic: string; grade?: number } | null;
  onExit?: () => void;
  onGameOver?: (data: { score: number; level: number; survivalTime: number }) => void;
}

export function GameContainer({ playerName, soloConfig, onExit, onGameOver }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnsweredCorrectly, setQuizAnsweredCorrectly] = useState<boolean | null>(null);
  const [filteredUpgrades, setFilteredUpgrades] = useState<any[]>([]);
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
  } = usePhaser('game-container', {
    isSolo: !!soloConfig,
    playerName
  });

  const { generateSoloQuizSet, getCurrentQuiz, submitAnswer, nextQuiz } = useQuizStore();

  // Initialize Solo Mode
  useEffect(() => {
    if (soloConfig) {
      generateSoloQuizSet(soloConfig);
    }
  }, [soloConfig]);

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

  // Handle level up - always show quiz (quiz must be correct to level up)
  useEffect(() => {
    if (levelUpData) {
      const quiz = getCurrentQuiz();
      // Always show quiz on level up - must answer correctly to level up
      if (quiz) {
        setShowQuiz(true);
        setQuizAnsweredCorrectly(null);
        pauseGame();
      } else {
        // No quiz available (ran out of questions), auto-pass and show all upgrades
        setFilteredUpgrades(levelUpData.upgrades);
        setQuizAnsweredCorrectly(true); // Treat as correct when no quiz
        // Confirm the level up since there's no quiz to fail
        EventBus.emit(GameEvents.QUIZ_RESULT, { correct: true });
      }
    }
  }, [levelUpData]);

  const handleQuizAnswer = (selectedIndex: number, isCorrect: boolean) => {
    submitAnswer(selectedIndex, 0);
    setShowQuiz(false);
    setQuizAnsweredCorrectly(isCorrect);
    nextQuiz(); // Move to next quiz for next time

    if (levelUpData) {
      if (isCorrect) {
        // Correct: Level up confirmed, get all 3 upgrade choices + bonus score
        setFilteredUpgrades(levelUpData.upgrades);
        EventBus.emit(GameEvents.QUIZ_RESULT, { correct: true });
      } else {
        // Wrong: Level up canceled, resume game without upgrades
        setFilteredUpgrades([]); // No upgrades shown
        EventBus.emit(GameEvents.QUIZ_RESULT, { correct: false });
        // Resume game after a short delay to show feedback
        setTimeout(() => {
          resumeGame();
        }, 500);
      }
    }
  };

  const handleUpgradeSelect = (type: string, id: string) => {
    selectUpgrade(type, id);
    setFilteredUpgrades([]);
    setQuizAnsweredCorrectly(null);
  };

  const handleJoystickMove = (x: number, y: number) => {
    sendJoystickInput(x, y);
  };

  // Determine if we should show upgrade selection
  const showUpgradeSelect = levelUpData && !showQuiz && filteredUpgrades.length > 0;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#0a0a0f',
      overflow: 'hidden',
    }}>
      {/* Game Canvas */}
      <div
        id="game-container"
        ref={containerRef}
        tabIndex={0}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
        }}
        onMouseDown={(e) => e.currentTarget.focus()}
      />

      {/* HUD Overlay */}
      {isReady && (
        <GameHUD />
      )}

      {/* Mobile Controls */}
      {isMobile && isReady && !levelUpData && !showQuiz && (
        <MobileControls onMove={handleJoystickMove} />
      )}

      {/* Quiz Overlay */}
      {showQuiz && getCurrentQuiz() && (
        <QuizOverlay
          quiz={getCurrentQuiz()!}
          timeLimit={15}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Upgrade Selection */}
      {showUpgradeSelect && (
        <UpgradeSelect
          upgrades={filteredUpgrades.map((u: any) => ({
            ...u,
            name: u.nameKo || u.name,
            description: u.descriptionKo || u.description,
            icon: u.icon || '⚡'
          }))}
          onSelect={handleUpgradeSelect}
          quizResult={quizAnsweredCorrectly}
        />
      )}

      {/* Loading State */}
      {!isReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          gap: 24,
        }}>
          {/* Dot loading animation */}
          <div className="dot-spinner">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
          <div style={{
            color: '#71717a',
            fontSize: 14,
            fontWeight: 500,
          }}>
            게임 로딩 중...
          </div>
        </div>
      )}
    </div>
  );
}
