import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PixelButton } from '../shared/PixelButton';
import { useRoomStore } from '../../stores/roomStore';
import type { QuizSet } from '../../types/quiz';

interface QRLobbyProps {
  quizSet: QuizSet;
  onGameStart: () => void;
}

export function QRLobby({ quizSet, onGameStart }: QRLobbyProps) {
  const {
    currentRoom,
    createRoom,
    updateRoomSettings,
    startGame,
  } = useRoomStore();

  const [settings, setSettings] = useState({
    maxPlayers: 30,
    gameDuration: 300,
    quizTimeLimit: 15,
    difficulty: 'mixed' as const,
    allowLateJoin: true,
  });

  useEffect(() => {
    if (!currentRoom) {
      createRoom('교사', quizSet.id, settings);
    }
  }, []);

  const handleStartGame = () => {
    startGame();
    onGameStart();
  };

  const joinUrl = currentRoom
    ? `${window.location.origin}/join/${currentRoom.code}`
    : '';

  const readyPlayers = currentRoom?.players.filter((p) => p.isReady).length || 0;
  const totalPlayers = currentRoom?.players.length || 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(12px, 2vw, 28px)',
      animation: 'slide-up 0.4s ease-out',
    }}>

      {/* Left: QR Code & Join Info */}
      <div className="pixel-card" style={{ padding: 'clamp(16px, 3vw, 36px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 13px)', color: '#fdcb6e', marginBottom: 'clamp(16px, 2.5vw, 32px)', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)' }}>
          📱 학생 참여
        </h3>

        {currentRoom && (
          <>
            {/* Room Code */}
            <div style={{
              width: '100%',
              borderRadius: '16px',
              padding: 'clamp(12px, 2vw, 24px)',
              marginBottom: 'clamp(16px, 2.5vw, 28px)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(232,67,147,0.08))',
              border: '1px solid rgba(155,89,182,0.3)',
            }}>
              <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#b8b5c8', marginBottom: '4px' }}>방 코드</p>
              <p className="font-pixel" style={{
                fontSize: 'clamp(20px, 3.5vw, 42px)',
                letterSpacing: '0.3em',
                color: '#fdcb6e',
                textShadow: '0 3px 0 #b8860b, 0 0 20px rgba(253,203,110,0.3)',
              }}>
                {currentRoom.code}
              </p>
            </div>

            {/* QR Code */}
            <div style={{ padding: 'clamp(12px, 2vw, 24px)', borderRadius: '16px', background: 'white', marginBottom: 'clamp(16px, 2.5vw, 28px)' }}>
              <QRCodeSVG
                value={joinUrl}
                size={Math.min(window.innerWidth * 0.15, 180)}
                level="M"
                includeMargin={true}
              />
            </div>

            {/* Join URL */}
            <div style={{
              width: '100%',
              borderRadius: '12px',
              padding: 'clamp(8px, 1vw, 14px)',
              marginBottom: 'clamp(12px, 1.5vw, 18px)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', color: '#6c6783', marginBottom: '2px' }}>접속 URL</p>
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.65vw, 8px)', color: '#b8b5c8', wordBreak: 'break-all' }}>
                {joinUrl}
              </p>
            </div>

            <PixelButton
              onClick={() => navigator.clipboard.writeText(joinUrl)}
              variant="secondary"
              className="w-full"
            >
              📋 URL 복사
            </PixelButton>
          </>
        )}
      </div>

      {/* Right: Settings & Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 24px)' }}>

        {/* Game Settings */}
        <div className="pixel-card" style={{ padding: 'clamp(14px, 2vw, 28px)' }}>
          <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 0.9vw, 12px)', color: '#fdcb6e', marginBottom: 'clamp(12px, 1.5vw, 20px)', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)' }}>
            ⚙️ 게임 설정
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.5vw, 18px)' }}>
            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                게임 시간: <span style={{ color: '#fdcb6e' }}>{Math.floor(settings.gameDuration / 60)}분</span>
              </label>
              <input type="range" min={180} max={600} step={60} value={settings.gameDuration}
                onChange={(e) => setSettings({ ...settings, gameDuration: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#9b59b6' }} />
            </div>
            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                퀴즈 제한 시간: <span style={{ color: '#fdcb6e' }}>{settings.quizTimeLimit}초</span>
              </label>
              <input type="range" min={10} max={30} step={5} value={settings.quizTimeLimit}
                onChange={(e) => setSettings({ ...settings, quizTimeLimit: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#9b59b6' }} />
            </div>
            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#b8b5c8', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                최대 인원: <span style={{ color: '#fdcb6e' }}>{settings.maxPlayers}명</span>
              </label>
              <input type="range" min={10} max={50} step={5} value={settings.maxPlayers}
                onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#9b59b6' }} />
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="pixel-card" style={{ padding: 'clamp(14px, 2vw, 28px)', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(10px, 1.5vw, 18px)' }}>
            <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 0.9vw, 12px)', color: '#fdcb6e', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)' }}>
              👥 참여자
            </h3>
            <span className="pixel-badge" style={{ background: 'rgba(0,184,148,0.15)', color: '#55efc4', fontSize: 'clamp(5px, 0.6vw, 8px)' }}>
              {readyPlayers}/{totalPlayers}명 준비
            </span>
          </div>

          <div style={{ maxHeight: 'clamp(120px, 18vh, 240px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 0.5vw, 8px)' }}>
            {currentRoom?.players.map((player) => (
              <div key={player.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'clamp(6px, 0.8vw, 12px)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span className="font-pixel" style={{ fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#fff' }}>{player.name}</span>
                <span className="pixel-badge" style={{
                  background: player.isReady ? 'rgba(0,184,148,0.15)' : 'rgba(253,203,110,0.15)',
                  color: player.isReady ? '#55efc4' : '#fdcb6e',
                  fontSize: 'clamp(5px, 0.55vw, 7px)',
                }}>
                  {player.isReady ? '✅ 준비완료' : '⏳ 대기중'}
                </span>
              </div>
            ))}
            {(!currentRoom || currentRoom.players.length === 0) && (
              <div style={{ textAlign: 'center', padding: 'clamp(20px, 4vw, 48px) 0' }}>
                <span style={{ fontSize: 'clamp(24px, 3vw, 40px)', display: 'block', marginBottom: '8px', animation: 'bounce-slow 2s ease-in-out infinite' }}>👋</span>
                <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#6c6783' }}>참여자를 기다리는 중...</p>
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <PixelButton onClick={handleStartGame} disabled={totalPlayers < 1} variant="success" size="lg" className="w-full">
          🎮 게임 시작 ({totalPlayers}명)
        </PixelButton>
      </div>
    </div>
  );
}
