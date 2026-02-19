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

  return (
    <div className="space-y-6">
      {/* Game Status Header */}
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-white font-pixel text-xl">게임 진행 중</h2>
            <p className="text-gray-400 font-pixel text-sm mt-1">
              경과 시간: {formatTime(gameTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-pixel-green font-pixel text-lg">
              {alivePlayers}명 생존
            </p>
            <p className="text-gray-400 font-pixel text-xs">
              총 {sortedPlayers.length}명
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
        <h3 className="text-white font-pixel text-lg mb-4">실시간 순위</h3>

        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-4 rounded-lg transition-all
                ${!player.isAlive ? 'opacity-50' : ''}
                ${index === 0 ? 'bg-yellow-900/30 border border-yellow-500' :
                  index === 1 ? 'bg-gray-500/30 border border-gray-400' :
                  index === 2 ? 'bg-orange-900/30 border border-orange-500' :
                  'bg-gray-700'
                }
              `}
            >
              {/* Rank */}
              <div className="flex items-center gap-4">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-pixel text-sm
                  ${index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-gray-600 text-white'
                  }
                `}>
                  {index + 1}
                </span>

                <div>
                  <p className="text-white font-pixel text-sm flex items-center gap-2">
                    {player.name}
                    {!player.isAlive && (
                      <span className="text-red-400 text-xs">💀</span>
                    )}
                  </p>
                  <p className="text-gray-400 font-pixel text-xs">
                    Lv.{player.level} | {player.correctAnswers}/{player.totalAnswers} 정답
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-pixel-gold font-pixel text-lg">
                  {player.score.toLocaleString()}
                </p>
                <p className="text-gray-400 font-pixel text-xs">
                  점수
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4">
        <PixelButton
          onClick={endGame}
          variant="danger"
          size="lg"
          className="flex-1"
        >
          게임 종료
        </PixelButton>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 text-center">
          <p className="text-2xl font-pixel text-pixel-gold">
            {sortedPlayers.reduce((sum, p) => sum + p.score, 0).toLocaleString()}
          </p>
          <p className="text-gray-400 font-pixel text-xs mt-1">총 점수</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 text-center">
          <p className="text-2xl font-pixel text-pixel-green">
            {sortedPlayers.reduce((sum, p) => sum + p.correctAnswers, 0)}
          </p>
          <p className="text-gray-400 font-pixel text-xs mt-1">총 정답</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 text-center">
          <p className="text-2xl font-pixel text-pixel-blue">
            {Math.round(
              (sortedPlayers.reduce((sum, p) => sum + p.correctAnswers, 0) /
              Math.max(1, sortedPlayers.reduce((sum, p) => sum + p.totalAnswers, 0))) * 100
            )}%
          </p>
          <p className="text-gray-400 font-pixel text-xs mt-1">평균 정답률</p>
        </div>
      </div>
    </div>
  );
}
