import React from 'react';
import { useGameStore } from '../../stores/gameStore';

export function GameHUD() {
  const { player, survivalTime, monstersKilled } = useGameStore();
  const { hp: playerHP, maxHp: playerMaxHP, xp: playerXP, xpToNext: playerMaxXP, level: playerLevel, score } = player;

  const hpPercent = Math.max(0, (playerHP / playerMaxHP) * 100);
  const xpPercent = Math.max(0, (playerXP / playerMaxXP) * 100);

  const hpColor = hpPercent > 50 ? '#00b894' : hpPercent > 25 ? '#fdcb6e' : '#d63031';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 'clamp(6px, 1vw, 14px)',
      pointerEvents: 'none',
    }}>

      {/* Left: Player Info */}
      <div style={{
        borderRadius: 'clamp(8px, 1vw, 14px)',
        padding: 'clamp(8px, 1.2vw, 16px)',
        minWidth: 'clamp(140px, 18vw, 260px)',
        background: 'rgba(10, 14, 26, 0.85)',
        border: '2px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Player Name + Level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.5vw, 8px)', marginBottom: 'clamp(6px, 0.8vw, 10px)' }}>
          <span style={{
            padding: 'clamp(2px, 0.3vw, 4px) clamp(4px, 0.5vw, 8px)',
            borderRadius: '6px',
            fontSize: 'clamp(6px, 0.7vw, 9px)',
            fontFamily: "'Press Start 2P', monospace",
            background: 'linear-gradient(135deg, #9b59b6, #e84393)',
            color: '#fff',
          }}>
            Lv.{playerLevel}
          </span>
          <span className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#fff' }}>Player</span>
        </div>

        {/* HP Bar */}
        <div style={{ marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: hpColor }}>❤️ HP</span>
            <span className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: '#b8b5c8' }}>{playerHP}/{playerMaxHP}</span>
          </div>
          <div style={{ width: '100%', height: 'clamp(6px, 0.7vw, 10px)', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              borderRadius: '999px',
              background: `linear-gradient(90deg, ${hpColor}, ${hpColor}88)`,
              transition: 'width 0.3s ease',
              animation: hpPercent <= 25 ? 'pulse-glow 0.5s ease-in-out infinite' : 'none',
            }} />
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: '#74b9ff' }}>⭐ XP</span>
            <span className="font-pixel" style={{ fontSize: 'clamp(5px, 0.55vw, 7px)', color: '#b8b5c8' }}>{playerXP}/{playerMaxXP}</span>
          </div>
          <div style={{ width: '100%', height: 'clamp(6px, 0.7vw, 10px)', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${xpPercent}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #3498db, #74b9ff)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Right: Score & Stats */}
      <div style={{
        borderRadius: 'clamp(8px, 1vw, 14px)',
        padding: 'clamp(8px, 1.2vw, 16px)',
        textAlign: 'right',
        background: 'rgba(10, 14, 26, 0.85)',
        border: '2px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
      }}>
        <p className="font-pixel" style={{
          fontSize: 'clamp(10px, 1.4vw, 18px)',
          color: '#fdcb6e',
          textShadow: '0 2px 0 #b8860b',
          marginBottom: 'clamp(4px, 0.5vw, 8px)',
        }}>
          {score.toLocaleString()}
        </p>
        <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#b8b5c8', marginBottom: 'clamp(2px, 0.3vw, 4px)' }}>
          💀 {monstersKilled} kills
        </p>
        <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#6c6783' }}>
          ⏱️ {formatTime(survivalTime)}
        </p>
      </div>
    </div>
  );
}
