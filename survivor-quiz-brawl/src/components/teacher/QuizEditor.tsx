import React, { useState } from 'react';
import { PixelButton } from '../shared/PixelButton';
import { useQuizStore } from '../../stores/quizStore';
import type { QuizSet, Quiz } from '../../types/quiz';

interface QuizEditorProps {
  onSelectForGame: (quizSet: QuizSet) => void;
}

export function QuizEditor({ onSelectForGame }: QuizEditorProps) {
  const { quizSets, updateQuiz, removeQuiz, removeQuizSet } = useQuizStore();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(
    quizSets.length > 0 ? quizSets[0].id : null
  );
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const selectedSet = quizSets.find((s) => s.id === selectedSetId);

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({ ...quiz });
  };

  const handleSaveQuiz = () => {
    if (!editingQuiz || !selectedSetId) return;
    updateQuiz(selectedSetId, editingQuiz.id, editingQuiz);
    setEditingQuiz(null);
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (!selectedSetId) return;
    if (confirm('이 문제를 삭제하시겠습니까?')) {
      removeQuiz(selectedSetId, quizId);
    }
  };

  const handleDeleteSet = (setId: string) => {
    if (confirm('이 퀴즈 세트를 삭제하시겠습니까?')) {
      removeQuizSet(setId);
      if (selectedSetId === setId) {
        setSelectedSetId(quizSets.length > 1 ? quizSets[0].id : null);
      }
    }
  };

  return (
    <div className="flex gap-6">
      {/* Quiz Set List */}
      <div className="w-64 bg-gray-800 rounded-lg p-4 border-2 border-gray-600">
        <h3 className="text-white font-pixel text-sm mb-4">퀴즈 세트</h3>
        <div className="space-y-2">
          {quizSets.map((set) => (
            <div
              key={set.id}
              className={`
                p-3 rounded cursor-pointer transition-colors
                ${selectedSetId === set.id
                  ? 'bg-pixel-purple border border-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
                }
              `}
              onClick={() => setSelectedSetId(set.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-pixel text-xs truncate">
                    {set.title}
                  </p>
                  <p className="text-gray-400 font-pixel text-xs mt-1">
                    {set.quizzes.length}문제
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSet(set.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz List & Editor */}
      <div className="flex-1 bg-gray-800 rounded-lg p-4 border-2 border-gray-600">
        {selectedSet ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-pixel text-sm">{selectedSet.title}</h3>
              <PixelButton
                onClick={() => onSelectForGame(selectedSet)}
                variant="success"
                size="sm"
              >
                게임 시작
              </PixelButton>
            </div>

            {/* Quiz Items */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedSet.quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-pixel-gold font-pixel text-xs">
                      Q{index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuiz(quiz)}
                        className="text-blue-400 hover:text-blue-300 font-pixel text-xs"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-red-400 hover:text-red-300 font-pixel text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="text-white font-pixel text-xs mb-3 leading-relaxed">
                    {quiz.question}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quiz.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`
                          p-2 rounded text-xs font-pixel
                          ${i === quiz.correctIndex
                            ? 'bg-green-900/50 text-green-400 border border-green-500'
                            : 'bg-gray-600 text-gray-300'
                          }
                        `}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 font-pixel text-sm">
              퀴즈 세트를 선택하세요
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-xl w-full mx-4 border-2 border-gray-600">
            <h3 className="text-white font-pixel text-lg mb-4">문제 수정</h3>

            {/* Question */}
            <div className="mb-4">
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                문제
              </label>
              <textarea
                value={editingQuiz.question}
                onChange={(e) => setEditingQuiz({ ...editingQuiz, question: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 text-white font-pixel text-sm p-3 rounded border-2 border-gray-600 focus:border-pixel-blue focus:outline-none resize-none"
              />
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="block text-gray-400 font-pixel text-xs mb-2">
                선택지 (정답 클릭)
              </label>
              <div className="space-y-2">
                {editingQuiz.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <button
                      onClick={() => setEditingQuiz({ ...editingQuiz, correctIndex: i })}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center font-pixel text-sm
                        ${editingQuiz.correctIndex === i
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                        }
                      `}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...editingQuiz.options];
                        newOptions[i] = e.target.value;
                        setEditingQuiz({ ...editingQuiz, options: newOptions });
                      }}
                      className="flex-1 bg-gray-700 text-white font-pixel text-sm px-3 py-2 rounded border-2 border-gray-600 focus:border-pixel-blue focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <PixelButton onClick={handleSaveQuiz} variant="success" className="flex-1">
                저장
              </PixelButton>
              <PixelButton onClick={() => setEditingQuiz(null)} variant="secondary" className="flex-1">
                취소
              </PixelButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
