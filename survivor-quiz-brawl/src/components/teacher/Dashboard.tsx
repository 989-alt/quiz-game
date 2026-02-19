import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { QuizEditor } from './QuizEditor';
import { QRLobby } from './QRLobby';
import { Leaderboard } from './Leaderboard';
import { PixelButton } from '../shared/PixelButton';
import { useQuizStore } from '../../stores/quizStore';
import { useRoomStore } from '../../stores/roomStore';
import type { QuizSet } from '../../types/quiz';

type TeacherStep = 'create' | 'edit' | 'lobby' | 'game';

const STEPS = [
  { id: 'create' as const, label: '퀴즈 만들기', icon: '📝', num: 1 },
  { id: 'edit' as const, label: '퀴즈 수정', icon: '✏️', num: 2 },
  { id: 'lobby' as const, label: '서버 열기', icon: '🌐', num: 3 },
  { id: 'game' as const, label: '게임 진행', icon: '🎮', num: 4 },
];

export function Dashboard() {
  const { quizSets } = useQuizStore();
  const { currentRoom } = useRoomStore();
  const [currentStep, setCurrentStep] = useState<TeacherStep>('create');
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const canProceed = (step: TeacherStep): boolean => {
    switch (step) {
      case 'create': return true;
      case 'edit': return quizSets.length > 0;
      case 'lobby': return selectedQuizSet !== null;
      case 'game': return currentRoom?.status === 'playing';
      default: return false;
    }
  };

  const getStepStatus = (stepId: TeacherStep): 'completed' | 'active' | 'locked' => {
    const stepOrder: TeacherStep[] = ['create', 'edit', 'lobby', 'game'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'locked';
  };

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 40px)' }}>

      {/* API Key Section */}
      <div className="pixel-card" style={{ padding: 'clamp(12px, 2vw, 24px)', marginBottom: 'clamp(16px, 2.5vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 16px)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}>🔑</span>
          <label className="font-pixel" style={{ fontSize: 'clamp(7px, 0.9vw, 11px)', color: '#b8b5c8' }}>
            Gemini API Key:
          </label>
          <input
            type="password"
            className="pixel-input"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="API 키를 입력하세요"
            style={{ flex: 1, minWidth: '160px', fontSize: 'clamp(7px, 0.8vw, 10px)', padding: 'clamp(6px, 0.8vw, 12px) clamp(8px, 1vw, 16px)' }}
          />
          {geminiApiKey && (
            <span className="pixel-badge" style={{ background: 'rgba(0,184,148,0.15)', color: '#55efc4', fontSize: 'clamp(6px, 0.7vw, 8px)' }}>
              ✅ 설정됨
            </span>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        marginBottom: 'clamp(20px, 3vw, 40px)',
        flexWrap: 'wrap',
      }}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => canProceed(step.id) && setCurrentStep(step.id)}
                disabled={!canProceed(step.id) && status === 'locked'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'clamp(4px, 0.5vw, 8px)',
                  padding: 'clamp(8px, 1vw, 16px)',
                  background: 'transparent',
                  border: 'none',
                  cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                  opacity: status === 'locked' ? 0.4 : 1,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 'clamp(36px, 4vw, 56px)',
                  height: 'clamp(36px, 4vw, 56px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(14px, 1.8vw, 22px)',
                  fontFamily: "'Press Start 2P', monospace",
                  background: status === 'completed'
                    ? 'linear-gradient(135deg, #00b894, #55efc4)'
                    : status === 'active'
                      ? 'linear-gradient(135deg, #9b59b6, #e84393)'
                      : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${status === 'completed' ? '#00b894' : status === 'active' ? '#9b59b6' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: status === 'active' ? '0 0 20px rgba(155,89,182,0.4)' : 'none',
                  color: status === 'locked' ? '#6c6783' : '#fff',
                }}>
                  {status === 'completed' ? '✓' : step.icon}
                </div>
                <span className="font-pixel" style={{
                  fontSize: 'clamp(6px, 0.7vw, 9px)',
                  color: status === 'active' ? '#fdcb6e' : status === 'completed' ? '#55efc4' : '#6c6783',
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div style={{
                  width: 'clamp(24px, 4vw, 60px)',
                  height: '3px',
                  background: getStepStatus(STEPS[index + 1].id) !== 'locked'
                    ? 'linear-gradient(90deg, #9b59b6, #e84393)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={{ animation: 'slide-up 0.4s ease-out' }}>
        {currentStep === 'create' && (
          <FileUpload
            apiKey={geminiApiKey}
            onQuizGenerated={(qs) => {
              setSelectedQuizSet(qs);
              setCurrentStep('edit');
            }}
          />
        )}

        {currentStep === 'edit' && (
          <QuizEditor
            quizSets={quizSets}
            selectedQuizSet={selectedQuizSet}
            onSelectQuizSet={setSelectedQuizSet}
            onStartGame={(qs) => {
              setSelectedQuizSet(qs);
              setCurrentStep('lobby');
            }}
          />
        )}

        {currentStep === 'lobby' && selectedQuizSet && (
          <QRLobby
            quizSet={selectedQuizSet}
            onGameStart={() => setCurrentStep('game')}
          />
        )}

        {currentStep === 'game' && <Leaderboard />}
      </div>
    </div>
  );
}
