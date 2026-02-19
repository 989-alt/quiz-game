import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { QuizEditor } from './QuizEditor';
import { QRLobby } from './QRLobby';
import { Leaderboard } from './Leaderboard';
import { useQuizStore } from '../../stores/quizStore';
import { useRoomStore } from '../../stores/roomStore';
import type { QuizSet } from '../../types/quiz';

type TeacherStep = 'create' | 'edit' | 'lobby' | 'game';

const STEPS = [
  { id: 'create' as const, label: '퀴즈 만들기', color: '#6366f1', num: 1 },
  { id: 'edit' as const, label: '퀴즈 수정', color: '#8b5cf6', num: 2 },
  { id: 'lobby' as const, label: '서버 열기', color: '#22d3ee', num: 3 },
  { id: 'game' as const, label: '게임 진행', color: '#10b981', num: 4 },
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
    <div style={{ padding: 'clamp(20px, 4vw, 48px)' }}>

      {/* API Key Section */}
      <div
        className="clean-card"
        style={{
          padding: 'clamp(16px, 2.5vw, 28px)',
          marginBottom: 'clamp(20px, 3vw, 40px)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 1.5vw, 20px)',
          flexWrap: 'wrap',
        }}>
          {/* Key icon as dots */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3,
            padding: 8,
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
          </div>
          <label style={{
            fontSize: 'clamp(12px, 1.1vw, 14px)',
            color: '#a1a1aa',
            fontWeight: 600,
          }}>
            Gemini API Key
          </label>
          <input
            type="password"
            className="clean-input"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="API 키를 입력하세요"
            style={{
              flex: 1,
              minWidth: '180px',
              fontSize: 'clamp(12px, 1vw, 14px)',
              padding: 'clamp(10px, 1vw, 14px) clamp(12px, 1.2vw, 18px)',
            }}
          />
          {geminiApiKey && (
            <span
              className="clean-badge badge-emerald"
              style={{ fontSize: 'clamp(10px, 0.9vw, 12px)' }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              설정됨
            </span>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        marginBottom: 'clamp(28px, 4vw, 48px)',
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
                  gap: 'clamp(8px, 1vw, 12px)',
                  padding: 'clamp(12px, 1.5vw, 20px)',
                  background: 'transparent',
                  border: 'none',
                  cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                  opacity: status === 'locked' ? 0.35 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Step indicator with dots */}
                <div style={{
                  width: 'clamp(44px, 5vw, 64px)',
                  height: 'clamp(44px, 5vw, 64px)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: status === 'active'
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)`
                    : status === 'completed'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border: `2px solid ${
                    status === 'active'
                      ? step.color
                      : status === 'completed'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  boxShadow: status === 'active'
                    ? `0 8px 24px -4px ${step.color}50`
                    : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {status === 'completed' ? (
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      ✓
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 4,
                    }}>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: status === 'active'
                              ? 'rgba(255, 255, 255, 0.9)'
                              : step.color,
                            opacity: status === 'locked' ? 0.3 : 0.8,
                            animation: status === 'active'
                              ? `dot-pulse 2s ease-in-out infinite ${i * 0.15}s`
                              : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 'clamp(11px, 1vw, 13px)',
                  fontWeight: 600,
                  color: status === 'active'
                    ? '#fafafa'
                    : status === 'completed'
                      ? '#6ee7b7'
                      : '#52525b',
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div style={{
                  width: 'clamp(32px, 5vw, 72px)',
                  height: 3,
                  borderRadius: 2,
                  background: getStepStatus(STEPS[index + 1].id) !== 'locked'
                    ? `linear-gradient(90deg, ${step.color}, ${STEPS[index + 1].color})`
                    : 'rgba(255, 255, 255, 0.06)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
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
