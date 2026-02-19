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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QR Code & Join Info */}
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
        <h3 className="text-white font-pixel text-lg mb-4 text-center">
          학생 참여
        </h3>

        {currentRoom && (
          <>
            {/* Room Code */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4 text-center">
              <p className="text-gray-400 font-pixel text-xs mb-2">방 코드</p>
              <p className="text-4xl font-pixel text-pixel-gold tracking-widest">
                {currentRoom.code}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg flex justify-center mb-4">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>

            {/* Join URL */}
            <div className="bg-gray-700 rounded p-3 mb-4">
              <p className="text-gray-400 font-pixel text-xs mb-1">접속 URL</p>
              <p className="text-white font-pixel text-xs break-all">
                {joinUrl}
              </p>
            </div>

            {/* Copy Button */}
            <PixelButton
              onClick={() => navigator.clipboard.writeText(joinUrl)}
              variant="secondary"
              className="w-full"
            >
              URL 복사
            </PixelButton>
          </>
        )}
      </div>

      {/* Settings & Players */}
      <div className="space-y-6">
        {/* Game Settings */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
          <h3 className="text-white font-pixel text-sm mb-4">게임 설정</h3>

          <div className="space-y-4">
            {/* Game Duration */}
            <div>
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                게임 시간: {Math.floor(settings.gameDuration / 60)}분
              </label>
              <input
                type="range"
                min={180}
                max={600}
                step={60}
                value={settings.gameDuration}
                onChange={(e) => setSettings({ ...settings, gameDuration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Quiz Time Limit */}
            <div>
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                퀴즈 제한 시간: {settings.quizTimeLimit}초
              </label>
              <input
                type="range"
                min={10}
                max={30}
                step={5}
                value={settings.quizTimeLimit}
                onChange={(e) => setSettings({ ...settings, quizTimeLimit: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                최대 인원: {settings.maxPlayers}명
              </label>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={settings.maxPlayers}
                onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-pixel text-sm">참여자</h3>
            <span className="text-gray-400 font-pixel text-xs">
              {readyPlayers}/{totalPlayers}명 준비
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {currentRoom?.players.map((player) => (
              <div
                key={player.id}
                className="flex justify-between items-center bg-gray-700 rounded px-3 py-2"
              >
                <span className="text-white font-pixel text-xs">
                  {player.name}
                </span>
                <span className={`font-pixel text-xs ${
                  player.isReady ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {player.isReady ? '준비완료' : '대기중'}
                </span>
              </div>
            ))}

            {(!currentRoom || currentRoom.players.length === 0) && (
              <p className="text-gray-500 font-pixel text-xs text-center py-4">
                참여자를 기다리는 중...
              </p>
            )}
          </div>
        </div>

        {/* Start Button */}
        <PixelButton
          onClick={handleStartGame}
          disabled={totalPlayers < 1}
          variant="success"
          size="lg"
          className="w-full"
        >
          게임 시작 ({totalPlayers}명)
        </PixelButton>
      </div>
    </div>
  );
}
