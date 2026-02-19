import React from 'react';
import { PixelButton } from '../shared/PixelButton';
import { useRoomStore } from '../../stores/roomStore';

export function Leaderboard() {
  const { currentRoom, leaderboard, endGame } = useRoomStore();

  const sortedPlayers = [...(currentRoom?.players || [])].sort((a, b) => b.score - a.score);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const gameTime = currentRoom?.startedAt
    ? Math.floor((Date.now() - currentRoom.startedAt) / 1000)
    : 0;

  const alivePlayers = sortedPlayers.filter((p) => p.isAlive).length;

  const rankIcons = ['🥇', '🥈', '🥉'];
  const rankBgs = [
    'linear-gradient(135deg, rgba(253,203,110,0.15), rgba(253,203,110,0.05))',
    'linear-gradient(135deg, rgba(178,190,195,0.15), rgba(178,190,195,0.05))',
    'linear-gradient(135deg, rgba(255,159,67,0.15), rgba(255,159,67,0.05))',
  ];
  const rankBorders = [
    'rgba(253,203,110,0.3)',
    'rgba(178,190,195,0.3)',
    'rgba(255,159,67,0.3)',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 24px)', animation: 'slide-up 0.4s ease-out' }}>

      {/* Game Status Header */}
      <div className="pixel-card" style={{ padding: 'clamp(14px, 2vw, 28px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="font-pixel" style={{ fontSize: 'clamp(10px, 1.3vw, 16px)', color: '#fdcb6e', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)' }}>
              🏆 게임 진행 중
            </h2>
            <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginTop: '4px' }}>
              ⏱️ 경과 시간: {formatTime(gameTime)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="font-pixel" style={{ fontSize: 'clamp(10px, 1.3vw, 16px)', color: '#55efc4' }}>{alivePlayers}명 생존</p>
            <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#6c6783' }}>총 {sortedPlayers.length}명</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="pixel-card" style={{ padding: 'clamp(14px, 2vw, 28px)' }}>
        <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 12px)', color: '#fdcb6e', marginBottom: 'clamp(12px, 1.5vw, 20px)', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)' }}>
          📊 실시간 순위
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 0.6vw, 10px)', maxHeight: 'clamp(200px, 35vh, 500px)', overflowY: 'auto' }}>
          {sortedPlayers.map((player, index) => (
            <div key={player.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'clamp(8px, 1.2vw, 16px)',
              borderRadius: '12px',
              background: index < 3 ? rankBgs[index] : 'rgba(255,255,255,0.03)',
              border: `1px solid ${index < 3 ? rankBorders[index] : 'rgba(255,255,255,0.06)'}`,
              opacity: player.isAlive ? 1 : 0.5,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 14px)' }}>
                <span style={{
                  width: 'clamp(24px, 2.5vw, 36px)',
                  height: 'clamp(24px, 2.5vw, 36px)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: index < 3 ? 'clamp(12px, 1.5vw, 20px)' : 'clamp(8px, 0.9vw, 12px)',
                  background: index >= 3 ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: index >= 3 ? '#6c6783' : undefined,
                  fontFamily: "'Press Start 2P', monospace",
                }}>
                  {index < 3 ? rankIcons[index] : index + 1}
                </span>
                <div>
                  <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.8vw, 10px)', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {player.name} {!player.isAlive && <span>💀</span>}
                  </p>
                  <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: '#6c6783' }}>
                    Lv.{player.level} | {player.correctAnswers}/{player.totalAnswers} 정답
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 14px)', color: '#fdcb6e', textShadow: '0 1px 0 #b8860b' }}>
                  {player.score.toLocaleString()}
                </p>
                <p className="font-pixel" style={{ fontSize: 'clamp(4px, 0.5vw, 6px)', color: '#6c6783' }}>점수</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <PixelButton onClick={endGame} variant="danger" size="lg" className="w-full">
        🛑 게임 종료
      </PixelButton>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 1.5vw, 20px)' }}>
        {[
          { value: sortedPlayers.reduce((s, p) => s + p.score, 0).toLocaleString(), label: '총 점수', color: '#fdcb6e', icon: '🏅' },
          { value: sortedPlayers.reduce((s, p) => s + p.correctAnswers, 0).toString(), label: '총 정답', color: '#55efc4', icon: '✅' },
          { value: `${Math.round((sortedPlayers.reduce((s, p) => s + p.correctAnswers, 0) / Math.max(1, sortedPlayers.reduce((s, p) => s + p.totalAnswers, 0))) * 100)}%`, label: '평균 정답률', color: '#74b9ff', icon: '📈' },
        ].map((stat, i) => (
          <div key={i} className="pixel-card" style={{ padding: 'clamp(10px, 1.5vw, 20px)', textAlign: 'center' }}>
            <span style={{ fontSize: 'clamp(16px, 2vw, 28px)', display: 'block', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>{stat.icon}</span>
            <p className="font-pixel" style={{ fontSize: 'clamp(10px, 1.3vw, 18px)', color: stat.color }}>{stat.value}</p>
            <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: '#6c6783', marginTop: '4px' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
