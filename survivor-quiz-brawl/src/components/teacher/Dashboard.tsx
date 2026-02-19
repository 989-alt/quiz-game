import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { QuizEditor } from './QuizEditor';
import { QRLobby } from './QRLobby';
import { Leaderboard } from './Leaderboard';
import { PixelButton } from '../shared/PixelButton';
import { useQuizStore } from '../../stores/quizStore';
import { useRoomStore } from '../../stores/roomStore';

type Tab = 'upload' | 'edit' | 'lobby' | 'game';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [apiKeyInput, setApiKeyInput] = useState('');

  const { quizSets, currentQuizSet, setCurrentQuizSet, geminiApiKey, setGeminiApiKey } = useQuizStore();
  const { currentRoom, isHost } = useRoomStore();

  const handleApiKeySave = () => {
    if (apiKeyInput.trim()) {
      setGeminiApiKey(apiKeyInput.trim());
      setApiKeyInput('');
    }
  };

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'upload', label: '퀴즈 생성' },
    { id: 'edit', label: '퀴즈 편집', disabled: quizSets.length === 0 },
    { id: 'lobby', label: '게임 로비', disabled: !currentQuizSet },
    { id: 'game', label: '진행 중', disabled: !currentRoom || currentRoom.status !== 'playing' },
  ];

  return (
    <div className="min-h-screen bg-pixel-dark">
      {/* Header */}
      <header className="bg-gray-900 border-b-4 border-pixel-purple p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-pixel text-pixel-gold">
              SURVIVOR QUIZ BRAWL
            </h1>
            <p className="text-gray-400 font-pixel text-xs mt-1">
              교사 대시보드
            </p>
          </div>

          {/* API Key Status */}
          <div className="flex items-center gap-4">
            {geminiApiKey ? (
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-pixel text-xs">API Key 설정됨</span>
                <button
                  onClick={() => setGeminiApiKey('')}
                  className="text-red-400 font-pixel text-xs hover:text-red-300"
                >
                  삭제
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Gemini API Key"
                  className="bg-gray-700 text-white font-pixel text-xs px-3 py-2 rounded border border-gray-600 w-48"
                />
                <PixelButton onClick={handleApiKeySave} size="sm" variant="success">
                  저장
                </PixelButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-6xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                px-6 py-3 font-pixel text-sm transition-colors
                ${activeTab === tab.id
                  ? 'bg-pixel-purple text-white border-b-4 border-purple-400'
                  : tab.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'upload' && (
          <FileUpload
            onQuizGenerated={() => setActiveTab('edit')}
          />
        )}

        {activeTab === 'edit' && (
          <QuizEditor
            onSelectForGame={(quizSet) => {
              setCurrentQuizSet(quizSet);
              setActiveTab('lobby');
            }}
          />
        )}

        {activeTab === 'lobby' && currentQuizSet && (
          <QRLobby
            quizSet={currentQuizSet}
            onGameStart={() => setActiveTab('game')}
          />
        )}

        {activeTab === 'game' && currentRoom && (
          <Leaderboard />
        )}
      </main>
    </div>
  );
}
