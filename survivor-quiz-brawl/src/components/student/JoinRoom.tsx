import { useState } from 'react';
import { PixelButton } from '../shared/PixelButton';

interface JoinRoomProps {
  onJoin: (code: string, name: string) => void;
  onPlaySolo: (name: string) => void;
  initialRoomCode?: string;
}

export function JoinRoom({ onJoin, onPlaySolo, initialRoomCode = '' }: JoinRoomProps) {
  const [mode, setMode] = useState<'select' | 'join' | 'solo'>('select');
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
      onPlaySolo(playerName.trim());
    }
  };

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
      <div className="bg-stars" />

      {/* Floating icons */}
      <div className="float-icon" style={{ top: '12%', left: '10%', fontSize: 'clamp(20px, 3vw, 36px)' }}>🎮</div>
      <div className="float-icon" style={{ top: '25%', right: '12%', animationDelay: '1s', fontSize: 'clamp(18px, 2.5vw, 32px)' }}>⚔️</div>
      <div className="float-icon" style={{ bottom: '20%', left: '8%', animationDelay: '2s', fontSize: 'clamp(16px, 2vw, 28px)' }}>🛡️</div>
      <div className="float-icon" style={{ bottom: '30%', right: '10%', animationDelay: '0.5s', fontSize: 'clamp(18px, 2.5vw, 32px)' }}>💎</div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 'clamp(320px, 45vw, 520px)',
        textAlign: 'center',
        animation: 'slide-up 0.6s ease-out',
      }}>

        {/* Title */}
        <div style={{ marginBottom: 'clamp(24px, 4vh, 48px)' }}>
          <h1 className="font-pixel" style={{
            fontSize: 'clamp(20px, 4vw, 48px)',
            color: '#fdcb6e',
            textShadow: '0 0 15px rgba(253,203,110,0.3), 0 3px 0 #b8860b',
            marginBottom: 'clamp(4px, 1vh, 12px)',
          }}>
            {mode === 'select' ? '참여하기' : mode === 'join' ? '방 참여' : '솔로 플레이'}
          </h1>
          <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.9vw, 10px)', color: '#b8b5c8' }}>
            {mode === 'select' ? '게임 모드를 선택하세요!' : '닉네임을 입력하고 시작!'}
          </p>
        </div>

        {/* Mode Selection */}
        {mode === 'select' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 2vw, 20px)' }}>
            <button onClick={() => setMode('join')} style={{
              padding: 'clamp(16px, 3vw, 36px)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(52,152,219,0.15), rgba(0,206,201,0.05))',
              border: '2px solid rgba(52,152,219,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(52,152,219,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(52,152,219,0.3)'; }}
            >
              <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 'clamp(8px, 1vw, 14px)', animation: 'bounce-slow 2s ease-in-out infinite' }}>🏠</div>
              <p className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 12px)', color: '#7ec8e3', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>방 참여</p>
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#6b9db7' }}>코드로 입장</p>
            </button>

            <button onClick={() => setMode('solo')} style={{
              padding: 'clamp(16px, 3vw, 36px)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,184,148,0.15), rgba(85,239,196,0.05))',
              border: '2px solid rgba(0,184,148,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(0,184,148,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(0,184,148,0.3)'; }}
            >
              <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: 'clamp(8px, 1vw, 14px)', animation: 'bounce-slow 2s ease-in-out infinite', animationDelay: '0.3s' }}>🎯</div>
              <p className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 12px)', color: '#55efc4', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>솔로 플레이</p>
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#6c9c8d' }}>혼자 연습</p>
            </button>
          </div>
        ) : (
          /* Join / Solo Form */
          <div className="pixel-card" style={{ padding: 'clamp(16px, 3vw, 32px)', animation: 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
            {mode === 'join' && (
              <div style={{ marginBottom: 'clamp(12px, 1.5vw, 18px)' }}>
                <label className="font-pixel" style={{ display: 'block', fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginBottom: 'clamp(6px, 0.8vw, 10px)', textAlign: 'left' }}>방 코드</label>
                <input
                  className="pixel-input"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={6}
                  style={{ width: '100%', fontSize: 'clamp(12px, 2vw, 22px)', textAlign: 'center', letterSpacing: '0.3em', padding: 'clamp(8px, 1.5vw, 16px)' }}
                />
              </div>
            )}

            <div style={{ marginBottom: 'clamp(14px, 2vw, 22px)' }}>
              <label className="font-pixel" style={{ display: 'block', fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginBottom: 'clamp(6px, 0.8vw, 10px)', textAlign: 'left' }}>닉네임</label>
              <input
                className="pixel-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="닉네임 입력"
                maxLength={12}
                style={{ width: '100%', fontSize: 'clamp(8px, 1.2vw, 14px)', padding: 'clamp(8px, 1.2vw, 16px)' }}
              />
            </div>

            {error && (
              <div style={{
                padding: 'clamp(6px, 0.8vw, 12px)',
                borderRadius: '10px',
                background: 'rgba(214,48,49,0.1)',
                border: '1px solid rgba(214,48,49,0.3)',
                marginBottom: 'clamp(12px, 1.5vw, 18px)',
                animation: 'shake 0.4s ease-in-out',
              }}>
                <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#ff7675' }}>❌ {error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'clamp(6px, 1vw, 12px)' }}>
              <PixelButton onClick={() => setMode('select')} variant="secondary" className="flex-1">← 뒤로</PixelButton>
              <PixelButton onClick={handleJoin} variant="primary" className="flex-1">
                {mode === 'join' ? '🚀 입장' : '🎯 시작'}
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
