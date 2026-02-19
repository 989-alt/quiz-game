import React from 'react';

interface GameHUDProps {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  score: number;
  survivalTime: number;
  wave: number;
  playerName: string;
}

export function GameHUD({
  hp,
  maxHp,
  level,
  xp,
  xpToNext,
  score,
  survivalTime,
  wave,
  playerName,
}: GameHUDProps) {
  const hpPercent = (hp / maxHp) * 100;
  const xpPercent = (xp / xpToNext) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-x-0 top-0 p-4 pointer-events-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Left: Player Info */}
        <div className="bg-black/70 rounded-lg p-3 min-w-[200px]">
          <div className="text-white font-pixel text-xs mb-2">{playerName}</div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400 font-pixel">HP</span>
              <span className="text-white font-pixel">{Math.ceil(hp)}/{maxHp}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400 font-pixel">LV {level}</span>
              <span className="text-white font-pixel">{xp}/{xpToNext}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="bg-black/70 rounded-lg p-3 text-right">
          <div className="text-yellow-400 font-pixel text-lg mb-1">
            {score.toLocaleString()}
          </div>
          <div className="text-white font-pixel text-xs">
            Wave {wave}
          </div>
          <div className="text-gray-400 font-pixel text-xs">
            {formatTime(survivalTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
