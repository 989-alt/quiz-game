import React, { useState } from 'react';
import { PixelButton } from '../shared/PixelButton';
import { useQuizStore } from '../../stores/quizStore';
import type { QuizSet, Quiz } from '../../types/quiz';

interface QuizEditorProps {
  quizSets: QuizSet[];
  selectedQuizSet: QuizSet | null;
  onSelectQuizSet: (qs: QuizSet) => void;
  onStartGame: (qs: QuizSet) => void;
}

export function QuizEditor({ quizSets, selectedQuizSet, onSelectQuizSet, onStartGame }: QuizEditorProps) {
  const { updateQuiz, removeQuiz } = useQuizStore();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionColors = ['#e84393', '#3498db', '#fdcb6e', '#00b894'];

  const handleSaveQuiz = () => {
    if (editingQuiz && selectedQuizSet) {
      updateQuiz(selectedQuizSet.id, editingQuiz.id, editingQuiz);
      setEditingQuiz(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'clamp(180px, 20vw, 280px) 1fr', gap: 'clamp(12px, 2vw, 24px)' }}>

      {/* Sidebar: Quiz Set List */}
      <div className="pixel-card" style={{ padding: 'clamp(12px, 1.5vw, 20px)' }}>
        <h3 className="font-pixel" style={{
          fontSize: 'clamp(7px, 0.9vw, 11px)',
          color: '#fdcb6e',
          marginBottom: 'clamp(12px, 1.5vw, 20px)',
        }}>
          📋 퀴즈 세트
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 0.8vw, 10px)' }}>
          {quizSets.map((qs) => (
            <button
              key={qs.id}
              onClick={() => onSelectQuizSet(qs)}
              style={{
                padding: 'clamp(8px, 1vw, 14px)',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: selectedQuizSet?.id === qs.id ? '#9b59b6' : 'rgba(255,255,255,0.08)',
                background: selectedQuizSet?.id === qs.id ? 'rgba(155,89,182,0.15)' : 'rgba(255,255,255,0.03)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#fff', marginBottom: '4px' }}>
                {qs.title}
              </p>
              <p className="font-pixel" style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', color: '#6c6783' }}>
                {qs.quizzes.length}문제
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main: Quiz List */}
      <div className="pixel-card" style={{ padding: 'clamp(16px, 2vw, 28px)' }}>
        {selectedQuizSet ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px, 2vw, 24px)', flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 13px)', color: '#fdcb6e' }}>
                ✏️ {selectedQuizSet.title}
              </h3>
              <PixelButton onClick={() => onStartGame(selectedQuizSet)} variant="success" size="md">
                🎮 이 세트로 게임 시작
              </PixelButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 14px)', maxHeight: 'clamp(300px, 45vh, 600px)', overflowY: 'auto' }}>
              {selectedQuizSet.quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 18px)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(6px, 0.8vw, 10px)' }}>
                    <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.85vw, 10px)', color: '#fff', flex: 1 }}>
                      <span style={{ color: '#9b59b6', marginRight: '8px' }}>Q{index + 1}.</span>
                      {quiz.question}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                      <button onClick={() => setEditingQuiz({ ...quiz })}
                        style={{ padding: 'clamp(4px, 0.4vw, 6px)', background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(10px, 1.2vw, 16px)' }}>
                        ✏️
                      </button>
                      <button onClick={() => removeQuiz(selectedQuizSet.id, quiz.id)}
                        style={{ padding: 'clamp(4px, 0.4vw, 6px)', background: 'rgba(214,48,49,0.15)', border: '1px solid rgba(214,48,49,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(10px, 1.2vw, 16px)' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(4px, 0.5vw, 8px)' }}>
                    {quiz.options.map((opt, oi) => (
                      <div key={oi} style={{
                        padding: 'clamp(4px, 0.5vw, 8px) clamp(6px, 0.8vw, 12px)',
                        borderRadius: '8px',
                        background: oi === quiz.correctIndex ? 'rgba(0,184,148,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${oi === quiz.correctIndex ? 'rgba(0,184,148,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        <span className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: optionColors[oi], marginRight: '4px' }}>
                          {optionLabels[oi]}.
                        </span>
                        <span className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: oi === quiz.correctIndex ? '#55efc4' : '#b8b5c8' }}>
                          {opt} {oi === quiz.correctIndex && '✓'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 'clamp(32px, 6vw, 80px) 0' }}>
            <span style={{ fontSize: 'clamp(32px, 5vw, 60px)', display: 'block', marginBottom: 'clamp(12px, 1.5vw, 20px)', animation: 'bounce-slow 2s ease-in-out infinite' }}>📚</span>
            <p className="font-pixel" style={{ fontSize: 'clamp(7px, 0.9vw, 11px)', color: '#6c6783' }}>
              왼쪽에서 퀴즈 세트를 선택하세요
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingQuiz && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          padding: 'clamp(16px, 4vw, 40px)',
        }}>
          <div className="pixel-card" style={{
            width: '100%',
            maxWidth: 'clamp(360px, 45vw, 560px)',
            padding: 'clamp(16px, 3vw, 32px)',
            animation: 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          }}>
            <h3 className="font-pixel" style={{ fontSize: 'clamp(8px, 1vw, 12px)', color: '#fdcb6e', marginBottom: 'clamp(14px, 2vw, 24px)' }}>
              ✏️ 문제 수정
            </h3>

            <div style={{ marginBottom: 'clamp(10px, 1.5vw, 18px)' }}>
              <label className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#b8b5c8', display: 'block', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>질문</label>
              <textarea
                className="pixel-input"
                value={editingQuiz.question}
                onChange={(e) => setEditingQuiz({ ...editingQuiz, question: e.target.value })}
                style={{ width: '100%', minHeight: 'clamp(50px, 8vw, 80px)', fontSize: 'clamp(7px, 0.8vw, 10px)', padding: 'clamp(6px, 0.8vw, 12px)' }}
              />
            </div>

            {editingQuiz.options.map((opt, i) => (
              <div key={i} style={{ marginBottom: 'clamp(6px, 0.8vw, 10px)' }}>
                <label className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 8px)', color: optionColors[i], display: 'block', marginBottom: '3px' }}>
                  {optionLabels[i]}
                </label>
                <div style={{ display: 'flex', gap: 'clamp(4px, 0.5vw, 8px)' }}>
                  <input
                    className="pixel-input"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...editingQuiz.options];
                      newOpts[i] = e.target.value;
                      setEditingQuiz({ ...editingQuiz, options: newOpts });
                    }}
                    style={{ flex: 1, fontSize: 'clamp(7px, 0.8vw, 10px)', padding: 'clamp(6px, 0.8vw, 10px)' }}
                  />
                  <button
                    onClick={() => setEditingQuiz({ ...editingQuiz, correctIndex: i })}
                    style={{
                      padding: 'clamp(4px, 0.5vw, 8px) clamp(8px, 0.8vw, 14px)',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'clamp(6px, 0.7vw, 9px)',
                      fontFamily: "'Press Start 2P', monospace",
                      background: editingQuiz.correctIndex === i ? 'linear-gradient(135deg, #00b894, #55efc4)' : 'rgba(255,255,255,0.06)',
                      color: editingQuiz.correctIndex === i ? '#fff' : '#6c6783',
                    }}
                  >
                    {editingQuiz.correctIndex === i ? '✓ 정답' : '정답'}
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 'clamp(6px, 0.8vw, 12px)', marginTop: 'clamp(12px, 1.5vw, 20px)' }}>
              <PixelButton onClick={handleSaveQuiz} variant="success" className="flex-1">저장</PixelButton>
              <PixelButton onClick={() => setEditingQuiz(null)} variant="secondary" className="flex-1">취소</PixelButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
