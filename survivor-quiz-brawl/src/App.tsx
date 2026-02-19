import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/teacher/Dashboard';
import { JoinRoom } from './components/student/JoinRoom';
import { GameContainer } from './components/student/GameContainer';

type AppView = 'home' | 'teacher' | 'student' | 'game';

// Dot cluster component for decorations
function DotCluster({
  x, y, color, delay = 0, size = 'md'
}: {
  x: string;
  y: string;
  color: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: { dot: 4, gap: 4 },
    md: { dot: 6, gap: 6 },
    lg: { dot: 8, gap: 8 },
  };
  const s = sizes[size];

  return (
    <div
      className="dot-cluster"
      style={{
        left: x,
        top: y,
        color,
        animationDelay: `${delay}s`,
        gap: s.gap,
      }}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="dot"
          style={{
            width: s.dot,
            height: s.dot,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [view, setView] = useState<AppView>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // Hash-based routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/teacher')) {
        setView('teacher');
      } else if (hash.startsWith('#/join/')) {
        const code = hash.replace('#/join/', '');
        setRoomCode(code);
        setView('student');
      } else if (hash.startsWith('#/student')) {
        setView('student');
      } else {
        setView('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = useCallback((target: AppView) => {
    setView(target);
    window.location.hash = target === 'home' ? '/' : `/${target}`;
  }, []);

  const handleJoinRoom = useCallback((code: string, name: string) => {
    setPlayerName(name);
    setRoomCode(code);
    setView('game');
  }, []);

  const [soloConfig, setSoloConfig] = useState<{ topic: string; grade?: number } | null>(null);

  const handlePlaySolo = useCallback((name: string, config: { topic: string; grade?: number }) => {
    setPlayerName(name);
    setSoloConfig(config);
    setRoomCode('SOLO');
    setView('game');
  }, []);

  const handleBackToHome = useCallback(() => {
    navigateTo('home');
    setSoloConfig(null);
  }, [navigateTo]);

  // Teacher Dashboard
  if (view === 'teacher') {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#0a0a0f',
        position: 'relative',
      }}>
        <div className="dot-grid-bg" />
        <header style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(16px, 2.5vw, 28px) clamp(20px, 4vw, 56px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 20px)' }}>
            {/* Logo dots */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 4,
              padding: 8,
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 12,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(14px, 2vw, 22px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fafafa',
              }}>
                Survivor Quiz Brawl
              </h1>
              <p style={{
                fontSize: 'clamp(11px, 1vw, 13px)',
                color: '#71717a',
                marginTop: 2,
                fontWeight: 500,
              }}>
                선생님 대시보드
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToHome}
            className="btn-clean btn-ghost"
            style={{
              padding: 'clamp(10px, 1.2vw, 14px) clamp(16px, 2vw, 24px)',
              fontSize: 'clamp(12px, 1vw, 14px)',
            }}
          >
            ← 홈으로
          </button>
        </header>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Dashboard />
        </div>
      </div>
    );
  }

  // Student Join Screen
  if (view === 'student') {
    return (
      <JoinRoom
        onJoin={handleJoinRoom}
        onPlaySolo={handlePlaySolo}
        initialRoomCode={roomCode}
      />
    );
  }

  // Game Screen
  if (view === 'game') {
    return (
      <GameContainer
        playerName={playerName}
        soloConfig={soloConfig}
        onExit={handleBackToHome}
      />
    );
  }

  // =================== HOME SCREEN ===================
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

      {/* Floating Dot Clusters */}
      <div className="floating-dots" style={{ inset: 0, position: 'absolute' }}>
        <DotCluster x="8%" y="15%" color="#6366f1" delay={0} size="lg" />
        <DotCluster x="85%" y="20%" color="#22d3ee" delay={1.5} size="md" />
        <DotCluster x="12%" y="75%" color="#10b981" delay={2} size="md" />
        <DotCluster x="80%" y="70%" color="#f59e0b" delay={0.5} size="lg" />
        <DotCluster x="50%" y="8%" color="#8b5cf6" delay={3} size="sm" />
        <DotCluster x="25%" y="45%" color="#6366f1" delay={1} size="sm" />
        <DotCluster x="75%" y="45%" color="#22d3ee" delay={2.5} size="sm" />
      </div>

      {/* Main Content */}
      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 'clamp(340px, 55vw, 680px)',
          textAlign: 'center',
        }}
      >

        {/* Logo */}
        <div style={{ marginBottom: 'clamp(32px, 6vh, 72px)' }}>
          {/* Animated dot matrix logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'clamp(20px, 3vh, 36px)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 'clamp(6px, 1vw, 12px)',
              padding: 'clamp(12px, 2vw, 24px)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 'clamp(16px, 2vw, 24px)',
            }}>
              {[
                '#6366f1', '#8b5cf6', '#a78bfa', '#8b5cf6', '#6366f1',
                '#22d3ee', '#6366f1', '#f43f5e', '#6366f1', '#22d3ee',
                '#10b981', '#f59e0b', '#6366f1', '#f59e0b', '#10b981',
              ].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 'clamp(10px, 1.5vw, 16px)',
                    height: 'clamp(10px, 1.5vw, 16px)',
                    borderRadius: '50%',
                    background: color,
                    opacity: 0.8,
                    animation: `dot-pulse 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(32px, 7vw, 80px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 'clamp(8px, 1.5vh, 16px)',
          }}>
            <span className="gradient-text">Survivor</span>
          </h1>
          <h2 style={{
            fontSize: 'clamp(20px, 4.5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: '#fafafa',
          }}>
            Quiz Brawl
          </h2>
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 18px)',
          color: '#71717a',
          marginBottom: 'clamp(32px, 6vh, 72px)',
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          퀴즈를 풀며 생존하라!
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            background: '#6366f1',
            borderRadius: '50%',
            margin: '0 12px',
            verticalAlign: 'middle',
          }} />
          최후의 1인이 되어라!
        </p>

        {/* Role Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'clamp(16px, 2.5vw, 32px)',
          maxWidth: 'clamp(320px, 45vw, 560px)',
          margin: '0 auto',
        }}>

          {/* Teacher Card */}
          <button
            onClick={() => navigateTo('teacher')}
            className="clean-card card-indigo"
            style={{
              padding: 'clamp(24px, 4vw, 48px) clamp(16px, 2.5vw, 32px)',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            {/* Dot icon */}
            <div style={{
              display: 'inline-grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 4,
              padding: 12,
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 16,
              marginBottom: 'clamp(12px, 2vh, 20px)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} />
            </div>
            <div style={{
              fontSize: 'clamp(15px, 1.8vw, 20px)',
              fontWeight: 700,
              color: '#a5b4fc',
              marginBottom: 'clamp(6px, 1vh, 12px)',
            }}>
              선생님
            </div>
            <div style={{
              fontSize: 'clamp(11px, 1vw, 14px)',
              color: '#6b7280',
              lineHeight: 1.6,
              fontWeight: 500,
            }}>
              퀴즈 만들기
              <br />
              게임 관리
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => navigateTo('student')}
            className="clean-card card-cyan"
            style={{
              padding: 'clamp(24px, 4vw, 48px) clamp(16px, 2.5vw, 32px)',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            {/* Dot icon */}
            <div style={{
              display: 'inline-grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              padding: 12,
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: 16,
              marginBottom: 'clamp(12px, 2vh, 20px)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
            </div>
            <div style={{
              fontSize: 'clamp(15px, 1.8vw, 20px)',
              fontWeight: 700,
              color: '#67e8f9',
              marginBottom: 'clamp(6px, 1vh, 12px)',
            }}>
              학생
            </div>
            <div style={{
              fontSize: 'clamp(11px, 1vw, 14px)',
              color: '#6b7280',
              lineHeight: 1.6,
              fontWeight: 500,
            }}>
              방 참여하기
              <br />
              게임 플레이
            </div>
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'clamp(32px, 6vh, 72px)' }}>
          {/* Dot separator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                }}
              />
            ))}
          </div>
          <p style={{
            fontSize: 'clamp(10px, 0.9vw, 12px)',
            color: '#52525b',
            fontWeight: 500,
          }}>
            © 2026 Survivor Quiz Brawl
          </p>
          <p style={{
            fontSize: 'clamp(9px, 0.8vw, 11px)',
            color: '#3f3f46',
            marginTop: 6,
          }}>
            Phaser 3 · React · Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
