import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/teacher/Dashboard';
import { JoinRoom } from './components/student/JoinRoom';
import { GameContainer } from './components/student/GameContainer';

type AppView = 'home' | 'teacher' | 'student' | 'game';

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

  const handlePlaySolo = useCallback((name: string) => {
    setPlayerName(name);
    setRoomCode('');
    setView('game');
  }, []);

  const handleBackToHome = useCallback(() => {
    navigateTo('home');
  }, [navigateTo]);

  // Teacher Dashboard
  if (view === 'teacher') {
    return (
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1028 0%, #251740 40%, #1e1535 100%)',
        position: 'relative',
      }}>
        <div className="bg-stars" />
        <header className="relative z-10" style={{
          padding: 'clamp(12px, 2vw, 24px) clamp(16px, 3vw, 48px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '3px solid rgba(155, 89, 182, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 16px)' }}>
            <span style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}>📚</span>
            <div>
              <h1 className="font-pixel" style={{ fontSize: 'clamp(10px, 1.5vw, 18px)', color: '#fdcb6e' }}>
                SURVIVOR QUIZ BRAWL
              </h1>
              <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.8vw, 10px)', color: '#b8b5c8', marginTop: '4px' }}>
                선생님 대시보드
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToHome}
            className="btn-pixel btn-purple"
            style={{ padding: 'clamp(8px, 1vw, 14px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(7px, 0.9vw, 11px)' }}
          >
            ← 홈으로
          </button>
        </header>
        <div className="relative z-10">
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
      padding: 'clamp(16px, 4vw, 60px)',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a1028 0%, #2d1b4e 30%, #1e1535 60%, #16102a 100%)',
    }}>

      {/* Twinkling Stars Background */}
      <div className="bg-stars" />

      {/* Floating Decorations */}
      <div className="float-icon" style={{ top: '10%', left: '8%', animationDelay: '0s', fontSize: 'clamp(20px, 3vw, 40px)' }}>⚔️</div>
      <div className="float-icon" style={{ top: '20%', right: '10%', animationDelay: '1s', fontSize: 'clamp(18px, 2.5vw, 36px)' }}>🛡️</div>
      <div className="float-icon" style={{ bottom: '25%', left: '5%', animationDelay: '2s', fontSize: 'clamp(16px, 2.2vw, 32px)' }}>🧠</div>
      <div className="float-icon" style={{ bottom: '15%', right: '8%', animationDelay: '0.5s', fontSize: 'clamp(18px, 2.8vw, 36px)' }}>📖</div>
      <div className="float-icon" style={{ top: '50%', left: '15%', animationDelay: '1.5s', fontSize: 'clamp(14px, 1.8vw, 24px)' }}>⭐</div>
      <div className="float-icon" style={{ top: '35%', right: '15%', animationDelay: '2.5s', fontSize: 'clamp(16px, 2vw, 28px)' }}>💎</div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 'clamp(320px, 50vw, 640px)',
        textAlign: 'center',
        animation: 'slide-up 0.8s ease-out',
      }}>

        {/* Game Logo */}
        <div style={{ marginBottom: 'clamp(24px, 5vh, 60px)', animation: 'float 3s ease-in-out infinite' }}>
          {/* Monster Icons Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 1.5vw, 20px)', marginBottom: 'clamp(12px, 2vh, 24px)' }}>
            {['👾', '🐲', '💀', '👻', '🎃'].map((emoji, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(24px, 4vw, 48px)',
                  animation: 'bounce-slow 2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="font-pixel"
            style={{
              fontSize: 'clamp(28px, 6vw, 72px)',
              lineHeight: 1.1,
              color: '#fdcb6e',
              textShadow: '0 0 20px rgba(253,203,110,0.4), 0 4px 0 #b8860b, 0 5px 0 #8b6914',
              letterSpacing: 'clamp(2px, 0.5vw, 6px)',
              marginBottom: 'clamp(4px, 1vh, 12px)',
            }}
          >
            SURVIVOR
          </h1>
          <h2
            className="font-pixel"
            style={{
              fontSize: 'clamp(18px, 4vw, 48px)',
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #e84393, #fd79a8, #e84393)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 3px 0 rgba(168, 50, 100, 0.6))',
              letterSpacing: 'clamp(1px, 0.4vw, 5px)',
            }}
          >
            QUIZ BRAWL
          </h2>
        </div>

        {/* Subtitle */}
        <p className="font-pixel" style={{
          fontSize: 'clamp(8px, 1.2vw, 14px)',
          color: '#b8b5c8',
          marginBottom: 'clamp(24px, 5vh, 60px)',
          lineHeight: 2,
        }}>
          퀴즈를 풀며 생존하라! 🎮
          <br />
          몬스터를 처치하고 최후의 1인이 되어라! 💪
        </p>

        {/* Role Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'clamp(12px, 2vw, 28px)',
          maxWidth: 'clamp(280px, 40vw, 520px)',
          margin: '0 auto',
        }}>

          {/* Teacher Card */}
          <button
            onClick={() => navigateTo('teacher')}
            className="group"
            style={{
              position: 'relative',
              padding: 'clamp(16px, 3vw, 40px) clamp(12px, 2vw, 28px)',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(155,89,182,0.05))',
              border: '2px solid rgba(155,89,182,0.3)',
              boxShadow: '0 4px 20px rgba(155,89,182,0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(155,89,182,0.6)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(155,89,182,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'rgba(155,89,182,0.3)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(155,89,182,0.1)';
            }}
          >
            <div style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 'clamp(8px, 1.5vh, 16px)', animation: 'wiggle 2s ease-in-out infinite' }}>
              🎓
            </div>
            <div className="font-pixel" style={{ fontSize: 'clamp(10px, 1.4vw, 16px)', color: '#c39bd3', marginBottom: 'clamp(4px, 0.8vh, 10px)' }}>
              선생님
            </div>
            <div className="font-pixel" style={{ fontSize: 'clamp(6px, 0.8vw, 10px)', color: '#8b7baa', lineHeight: 2 }}>
              퀴즈 만들기
              <br />
              게임 관리
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '16px', opacity: 0,
              background: 'radial-gradient(circle at center, rgba(155,89,182,0.1), transparent 70%)',
              transition: 'opacity 0.3s',
            }}
              className="group-hover:!opacity-100"
            />
          </button>

          {/* Student Card */}
          <button
            onClick={() => navigateTo('student')}
            className="group"
            style={{
              position: 'relative',
              padding: 'clamp(16px, 3vw, 40px) clamp(12px, 2vw, 28px)',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(52,152,219,0.15), rgba(0,206,201,0.05))',
              border: '2px solid rgba(52,152,219,0.3)',
              boxShadow: '0 4px 20px rgba(52,152,219,0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(52,152,219,0.6)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(52,152,219,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'rgba(52,152,219,0.3)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(52,152,219,0.1)';
            }}
          >
            <div style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 'clamp(8px, 1.5vh, 16px)', animation: 'wiggle 2s ease-in-out infinite', animationDelay: '0.3s' }}>
              🎮
            </div>
            <div className="font-pixel" style={{ fontSize: 'clamp(10px, 1.4vw, 16px)', color: '#7ec8e3', marginBottom: 'clamp(4px, 0.8vh, 10px)' }}>
              학생
            </div>
            <div className="font-pixel" style={{ fontSize: 'clamp(6px, 0.8vw, 10px)', color: '#6b9db7', lineHeight: 2 }}>
              방 참여하기
              <br />
              게임 플레이
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '16px', opacity: 0,
              background: 'radial-gradient(circle at center, rgba(52,152,219,0.1), transparent 70%)',
              transition: 'opacity 0.3s',
            }}
              className="group-hover:!opacity-100"
            />
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'clamp(24px, 5vh, 60px)' }}>
          <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.7vw, 8px)', color: '#6c6783' }}>
            © 2026 Survivor Quiz Brawl
          </p>
          <p className="font-pixel" style={{ fontSize: 'clamp(4px, 0.6vw, 7px)', color: '#4a4562', marginTop: '4px' }}>
            Powered by Phaser 3 + React + Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
