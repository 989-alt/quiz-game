import React, { useState } from 'react';
import { PixelButton } from '../shared/PixelButton';

interface JoinRoomProps {
  onJoin: (roomCode: string, playerName: string) => void;
  onPlaySolo: (playerName: string) => void;
  initialRoomCode?: string;
}

export function JoinRoom({ onJoin, onPlaySolo, initialRoomCode = '' }: JoinRoomProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'select' | 'join' | 'solo'>('select');

  const handleJoin = () => {
    if (!playerName.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    if (!roomCode.trim()) {
      setError('방 코드를 입력해주세요');
      return;
    }
    onJoin(roomCode.toUpperCase(), playerName.trim());
  };

  const handleSolo = () => {
    if (!playerName.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    onPlaySolo(playerName.trim());
  };

  return (
    <div className="min-h-screen bg-pixel-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-pixel text-pixel-gold mb-2">
            SURVIVOR
          </h1>
          <h2 className="text-2xl font-pixel text-pixel-red">
            QUIZ BRAWL
          </h2>
        </div>

        {mode === 'select' && (
          <div className="space-y-4">
            <PixelButton
              onClick={() => setMode('join')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              방 참여하기
            </PixelButton>
            <PixelButton
              onClick={() => setMode('solo')}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              혼자 플레이
            </PixelButton>
          </div>
        )}

        {(mode === 'join' || mode === 'solo') && (
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
            <h3 className="text-white font-pixel text-lg mb-4 text-center">
              {mode === 'join' ? '방 참여하기' : '혼자 플레이'}
            </h3>

            {/* Player Name Input */}
            <div className="mb-4">
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                placeholder="이름을 입력하세요"
                maxLength={12}
                className="w-full bg-gray-700 text-white font-pixel text-sm px-4 py-3 rounded border-2 border-gray-600 focus:border-pixel-blue focus:outline-none"
              />
            </div>

            {/* Room Code Input (only for join mode) */}
            {mode === 'join' && (
              <div className="mb-4">
                <label className="block text-gray-400 font-pixel text-xs mb-2">
                  방 코드
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="ABCD12"
                  maxLength={6}
                  className="w-full bg-gray-700 text-white font-pixel text-lg px-4 py-3 rounded border-2 border-gray-600 focus:border-pixel-blue focus:outline-none text-center tracking-widest"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded">
                <p className="text-red-400 font-pixel text-xs text-center">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <PixelButton
                onClick={mode === 'join' ? handleJoin : handleSolo}
                variant="success"
                size="lg"
                className="w-full"
              >
                {mode === 'join' ? '참여하기' : '시작하기'}
              </PixelButton>
              <PixelButton
                onClick={() => setMode('select')}
                variant="secondary"
                size="md"
                className="w-full"
              >
                뒤로가기
              </PixelButton>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 font-pixel text-xs">
            WASD 또는 화살표 키로 이동
          </p>
        </div>
      </div>
    </div>
  );
}
