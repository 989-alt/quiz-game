import React from 'react';
import { PixelButton } from '../shared/PixelButton';

interface Upgrade {
  type: 'weapon' | 'passive';
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  currentLevel: number;
  maxLevel: number;
  isNew: boolean;
  isEvolution?: boolean;
}

interface UpgradeSelectProps {
  level: number;
  upgrades: Upgrade[];
  onSelect: (type: string, id: string) => void;
}

export function UpgradeSelect({ level, upgrades, onSelect }: UpgradeSelectProps) {
  const getCardStyle = (upgrade: Upgrade) => {
    if (upgrade.isEvolution) {
      return 'bg-gradient-to-b from-yellow-900 to-yellow-700 border-yellow-400';
    }
    if (upgrade.isNew) {
      return 'bg-gradient-to-b from-purple-900 to-purple-700 border-purple-400';
    }
    return 'bg-gradient-to-b from-gray-800 to-gray-700 border-gray-500';
  };

  const getLevelDisplay = (upgrade: Upgrade) => {
    if (upgrade.isNew) {
      return 'NEW';
    }
    if (upgrade.isEvolution) {
      return 'EVOLVE';
    }
    return `Lv ${upgrade.currentLevel} → ${upgrade.currentLevel + 1}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-yellow-400 font-pixel text-2xl mb-2">
            LEVEL UP!
          </h2>
          <p className="text-white font-pixel text-lg">
            Level {level}
          </p>
          <p className="text-gray-400 font-pixel text-sm mt-2">
            업그레이드를 선택하세요
          </p>
        </div>

        {/* Upgrade Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upgrades.map((upgrade) => (
            <button
              key={`${upgrade.type}-${upgrade.id}`}
              onClick={() => onSelect(upgrade.type, upgrade.id)}
              className={`
                ${getCardStyle(upgrade)}
                border-2 rounded-lg p-4 transition-all duration-200
                hover:scale-105 hover:shadow-lg hover:shadow-white/20
                active:scale-95
              `}
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-3">
                <span className={`
                  px-2 py-1 rounded text-xs font-pixel
                  ${upgrade.type === 'weapon' ? 'bg-red-600' : 'bg-blue-600'}
                `}>
                  {upgrade.type === 'weapon' ? '무기' : '패시브'}
                </span>
                <span className={`
                  px-2 py-1 rounded text-xs font-pixel
                  ${upgrade.isEvolution ? 'bg-yellow-500 text-black' :
                    upgrade.isNew ? 'bg-purple-500' : 'bg-gray-600'}
                `}>
                  {getLevelDisplay(upgrade)}
                </span>
              </div>

              {/* Icon Placeholder */}
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-3xl">
                  {upgrade.type === 'weapon' ? '⚔️' : '💎'}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-white font-pixel text-sm mb-2 text-center">
                {upgrade.nameKo}
              </h3>

              {/* Description */}
              <p className="text-gray-300 font-pixel text-xs text-center leading-relaxed">
                {upgrade.descriptionKo}
              </p>

              {/* Max Level Indicator */}
              {!upgrade.isNew && !upgrade.isEvolution && (
                <div className="mt-3 flex justify-center gap-1">
                  {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < upgrade.currentLevel ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Skip Button (optional) */}
        <div className="text-center mt-6">
          <button
            onClick={() => onSelect('skip', 'skip')}
            className="text-gray-500 font-pixel text-xs hover:text-gray-300 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
