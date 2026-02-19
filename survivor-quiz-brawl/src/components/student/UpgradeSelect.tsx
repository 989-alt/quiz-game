import React from 'react';
import type { UpgradeOption } from '../../types/game';

interface UpgradeSelectProps {
  upgrades: UpgradeOption[];
  onSelect: (type: string, id: string) => void;
}

export function UpgradeSelect({ upgrades, onSelect }: UpgradeSelectProps) {
  const getRarity = (upgrade: UpgradeOption): string => {
    if (upgrade.isEvolution) return 'evolution';
    if (upgrade.isNew) return 'new';
    return 'upgrade';
  };

  const getCardStyle = (upgrade: UpgradeOption): React.CSSProperties => {
    const rarity = getRarity(upgrade);
    switch (rarity) {
      case 'evolution': return { borderColor: 'rgba(253,203,110,0.5)', background: 'linear-gradient(135deg, rgba(253,203,110,0.12), rgba(253,203,110,0.03))' };
      case 'new': return { borderColor: 'rgba(155,89,182,0.5)', background: 'linear-gradient(135deg, rgba(155,89,182,0.12), rgba(155,89,182,0.03))' };
      default: return { borderColor: 'rgba(52,152,219,0.4)', background: 'linear-gradient(135deg, rgba(52,152,219,0.1), rgba(52,152,219,0.03))' };
    }
  };

  const rarityColors: Record<string, string> = {
    evolution: '#fdcb6e',
    new: '#c39bd3',
    upgrade: '#74b9ff',
  };

  const rarityLabels: Record<string, string> = {
    evolution: '진화',
    new: '신규',
    upgrade: '강화',
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      zIndex: 50,
      padding: 'clamp(12px, 3vw, 40px)',
    }}>
      <div style={{ width: '100%', maxWidth: 'clamp(400px, 60vw, 800px)', textAlign: 'center' }}>
        {/* Level Up Header */}
        <div style={{ marginBottom: 'clamp(16px, 3vh, 36px)', animation: 'bounce-slow 2s ease-in-out infinite' }}>
          <h2 className="font-pixel" style={{
            fontSize: 'clamp(16px, 3vw, 36px)',
            color: '#fdcb6e',
            textShadow: '0 0 20px rgba(253,203,110,0.4), 0 3px 0 #b8860b',
            marginBottom: 'clamp(4px, 0.5vw, 8px)',
          }}>
            ⬆️ LEVEL UP!
          </h2>
          <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.8vw, 10px)', color: '#b8b5c8' }}>업그레이드를 선택하세요</p>
        </div>

        {/* Upgrade Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(upgrades.length, 3)}, 1fr)`,
          gap: 'clamp(8px, 1.5vw, 20px)',
        }}>
          {upgrades.map((upgrade, index) => (
            <button
              key={`${upgrade.type}-${upgrade.id}`}
              onClick={() => onSelect(upgrade.type, upgrade.id)}
              style={{
                ...getCardStyle(upgrade),
                border: '2px solid',
                borderRadius: '16px',
                padding: 'clamp(14px, 2vw, 28px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                animation: `pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {/* Rarity Badge */}
              <span className="pixel-badge" style={{
                background: `${rarityColors[getRarity(upgrade)]}22`,
                color: rarityColors[getRarity(upgrade)],
                fontSize: 'clamp(5px, 0.55vw, 7px)',
                marginBottom: 'clamp(6px, 0.8vw, 12px)',
                display: 'inline-block',
              }}>
                {rarityLabels[getRarity(upgrade)]}
              </span>

              {/* Icon */}
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', margin: 'clamp(6px, 1vw, 14px) 0' }}>
                {upgrade.icon || '⚡'}
              </div>

              {/* Name */}
              <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.85vw, 11px)', color: '#fff', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                {upgrade.name}
              </p>

              {/* Description */}
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 8px)', color: '#b8b5c8', lineHeight: 2 }}>
                {upgrade.description}
              </p>

              {/* Level Dots */}
              {upgrade.currentLevel !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: 'clamp(6px, 0.8vw, 12px)' }}>
                  {Array.from({ length: upgrade.maxLevel || 5 }).map((_, i) => (
                    <div key={i} style={{
                      width: 'clamp(4px, 0.5vw, 8px)',
                      height: 'clamp(4px, 0.5vw, 8px)',
                      borderRadius: '50%',
                      background: i <= (upgrade.currentLevel || 0) ? '#9b59b6' : 'rgba(255,255,255,0.15)',
                    }} />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
