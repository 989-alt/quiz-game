import { useState } from 'react';

interface JoinRoomProps {
  onJoin: (code: string, name: string) => void;
  onPlaySolo: (name: string, config: { topic: string; grade?: number }) => void;
  initialRoomCode?: string;
}

// Dot icon component
function DotIcon({ colors, size = 8, gap = 3, cols = 2 }: {
  colors: string[];
  size?: number;
  gap?: number;
  cols?: number;
}) {
  return (
    <div style={{
      display: 'inline-grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      padding: 10,
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
    }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            animation: 'dot-pulse 2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export function JoinRoom({ onJoin, onPlaySolo, initialRoomCode = '' }: JoinRoomProps) {
  const [mode, setMode] = useState<'select' | 'join' | 'solo'>('select');
  const [soloStep, setSoloStep] = useState<'topic' | 'grade' | 'name'>('topic');
  const [soloConfig, setSoloConfig] = useState<{ topic: string; grade?: number }>({ topic: '' });

  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!playerName.trim()) { setError('닉네임을 입력해주세요!'); return; }
    if (mode === 'join' && !roomCode.trim()) { setError('방 코드를 입력해주세요!'); return; }

    setError('');
    if (mode === 'join') {
      onJoin(roomCode.trim(), playerName.trim());
    } else {
      onPlaySolo(playerName.trim(), soloConfig);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSoloConfig({ ...soloConfig, topic });
    if (topic === 'math') {
      setSoloStep('grade');
    } else {
      setSoloStep('name');
    }
  };

  const handleGradeSelect = (grade: number) => {
    setSoloConfig({ ...soloConfig, grade });
    setSoloStep('name');
  };

  // Step indicator dots
  const getStepCount = () => {
    if (mode === 'select') return 0;
    if (mode === 'join') return 1;
    if (soloStep === 'topic') return 1;
    if (soloStep === 'grade') return 2;
    return soloConfig.topic === 'math' ? 3 : 2;
  };

  const totalSteps = mode === 'solo' && soloConfig.topic === 'math' ? 3 : 2;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 5vw, 80px)',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0a0f',
    }}>
      {/* Dot Grid Background */}
      <div className="dot-grid-bg" />

      {/* Floating dot decorations */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.4 }}>
        <DotIcon colors={['#6366f1', '#8b5cf6', '#6366f1', '#8b5cf6']} size={6} />
      </div>
      <div style={{ position: 'absolute', top: '25%', right: '12%', opacity: 0.3, animation: 'float 8s ease-in-out infinite 1s' }}>
        <DotIcon colors={['#22d3ee', '#06b6d4', '#22d3ee']} cols={3} size={5} />
      </div>
      <div style={{ position: 'absolute', bottom: '20%', left: '8%', opacity: 0.3, animation: 'float 8s ease-in-out infinite 2s' }}>
        <DotIcon colors={['#10b981', '#34d399']} cols={2} size={5} />
      </div>
      <div style={{ position: 'absolute', bottom: '30%', right: '10%', opacity: 0.4, animation: 'float 8s ease-in-out infinite 0.5s' }}>
        <DotIcon colors={['#f59e0b', '#fbbf24', '#f59e0b', '#fbbf24']} size={6} />
      </div>

      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 'clamp(340px, 50vw, 560px)',
          textAlign: 'center',
        }}
      >

        {/* Header */}
        <div style={{ marginBottom: 'clamp(28px, 5vh, 56px)' }}>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 'clamp(8px, 1.5vh, 16px)',
          }}>
            <span className={mode === 'join' ? 'gradient-text-cyan' : mode === 'solo' ? 'gradient-text' : 'gradient-text'}>
              {mode === 'select' ? '참여하기' : mode === 'join' ? '방 참여' : '솔로 플레이'}
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(12px, 1.3vw, 16px)',
            color: '#71717a',
            fontWeight: 500,
          }}>
            {mode === 'select' ? '게임 모드를 선택하세요' :
              mode === 'solo' && soloStep === 'topic' ? '주제를 선택하세요' :
                mode === 'solo' && soloStep === 'grade' ? '학년을 선택하세요' :
                  '닉네임을 입력하고 시작하세요'}
          </p>

          {/* Step indicator */}
          {mode !== 'select' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 20,
            }}>
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i + 1 <= getStepCount() ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i + 1 <= getStepCount() ? (mode === 'join' ? '#22d3ee' : '#6366f1') : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mode Selection */}
        {mode === 'select' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(14px, 2.5vw, 24px)' }}>
            <button
              onClick={() => setMode('join')}
              className="clean-card card-cyan"
              style={{
                padding: 'clamp(24px, 4vw, 44px) clamp(16px, 2vw, 24px)',
                cursor: 'pointer',
                border: '1px solid rgba(34, 211, 238, 0.2)',
              }}
            >
              <div style={{ marginBottom: 'clamp(12px, 2vh, 20px)' }}>
                <DotIcon colors={['#22d3ee', '#06b6d4', '#0891b2', '#22d3ee']} size={10} gap={4} />
              </div>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', fontWeight: 700, color: '#67e8f9', marginBottom: 6 }}>
                방 참여
              </p>
              <p style={{ fontSize: 'clamp(11px, 1vw, 13px)', color: '#6b7280', fontWeight: 500 }}>
                코드로 입장
              </p>
            </button>

            <button
              onClick={() => { setMode('solo'); setSoloStep('topic'); }}
              className="clean-card card-indigo"
              style={{
                padding: 'clamp(24px, 4vw, 44px) clamp(16px, 2vw, 24px)',
                cursor: 'pointer',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <div style={{ marginBottom: 'clamp(12px, 2vh, 20px)' }}>
                <DotIcon colors={['#6366f1', '#8b5cf6', '#a78bfa', '#6366f1']} size={10} gap={4} />
              </div>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>
                솔로 플레이
              </p>
              <p style={{ fontSize: 'clamp(11px, 1vw, 13px)', color: '#6b7280', fontWeight: 500 }}>
                혼자 연습
              </p>
            </button>
          </div>
        ) : mode === 'solo' && soloStep === 'topic' ? (
          /* Solo Topic Selection */
          <div
            className="clean-card animate-scale-in"
            style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}
          >
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { id: 'math', label: '수학 연산', colors: ['#f59e0b', '#fbbf24', '#f59e0b', '#fbbf24', '#d97706', '#f59e0b'] },
                { id: 'spelling', label: '맞춤법', colors: ['#10b981', '#34d399', '#10b981', '#34d399', '#059669', '#10b981'] },
                { id: 'idiom', label: '속담/사자성어', colors: ['#8b5cf6', '#a78bfa', '#8b5cf6', '#a78bfa', '#7c3aed', '#8b5cf6'] }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTopicSelect(item.id)}
                  className="clean-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <DotIcon colors={item.colors} cols={3} size={6} gap={3} />
                  <span style={{ fontSize: 'clamp(13px, 1.4vw, 16px)', fontWeight: 600, color: '#e4e4e7' }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setMode('select')}
              className="btn-clean btn-ghost"
              style={{ width: '100%', marginTop: 20, padding: '12px 20px', fontSize: 14 }}
            >
              ← 뒤로
            </button>
          </div>
        ) : mode === 'solo' && soloStep === 'grade' ? (
          /* Solo Grade Selection (Math only) */
          <div
            className="clean-card animate-scale-in"
            style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5, 6].map(g => (
                <button
                  key={g}
                  onClick={() => handleGradeSelect(g)}
                  className="clean-card"
                  style={{
                    padding: 'clamp(16px, 2.5vw, 24px)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: `hsl(${40 + g * 8}, 90%, 55%)`,
                  }} />
                  <span style={{ fontSize: 'clamp(13px, 1.4vw, 16px)', fontWeight: 700, color: '#e4e4e7' }}>
                    {g}학년
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSoloStep('topic')}
              className="btn-clean btn-ghost"
              style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}
            >
              ← 뒤로
            </button>
          </div>
        ) : (
          /* Join / Solo Name Form */
          <div
            className="clean-card animate-scale-in"
            style={{ padding: 'clamp(24px, 4vw, 40px)' }}
          >
            {mode === 'join' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#a1a1aa',
                  marginBottom: 10,
                  textAlign: 'left',
                }}>
                  방 코드
                </label>
                <input
                  className="clean-input"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={6}
                  style={{
                    fontSize: 'clamp(18px, 2.5vw, 28px)',
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontWeight: 700,
                    padding: 'clamp(14px, 2vw, 20px)',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#a1a1aa',
                marginBottom: 10,
                textAlign: 'left',
              }}>
                닉네임
              </label>
              <input
                className="clean-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={12}
                style={{
                  fontSize: 'clamp(14px, 1.5vw, 18px)',
                  padding: 'clamp(12px, 1.5vw, 18px)',
                }}
              />
            </div>

            {error && (
              <div
                className="animate-shake"
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
                <p style={{ fontSize: 13, color: '#fda4af', fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => mode === 'solo' ? setSoloStep(soloConfig.topic === 'math' ? 'grade' : 'topic') : setMode('select')}
                className="btn-clean btn-ghost"
                style={{ flex: 1, padding: '14px 20px', fontSize: 14 }}
              >
                ← 뒤로
              </button>
              <button
                onClick={handleJoin}
                className={`btn-clean ${mode === 'join' ? 'btn-cyan' : 'btn-indigo'}`}
                style={{ flex: 1, padding: '14px 20px', fontSize: 14 }}
              >
                {mode === 'join' ? '입장하기' : '시작하기'}
              </button>
            </div>
          </div>
        )}

        {/* Back to home */}
        {mode === 'select' && (
          <button
            onClick={() => window.location.hash = '/'}
            className="btn-clean btn-ghost"
            style={{
              marginTop: 'clamp(24px, 4vh, 40px)',
              padding: '12px 24px',
              fontSize: 13,
            }}
          >
            ← 홈으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}
