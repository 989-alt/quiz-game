import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from '../shared/Timer';
import type { Quiz } from '../../types/quiz';

interface QuizOverlayProps {
  quiz: Quiz;
  timeLimit: number;
  onAnswer: (index: number, isCorrect: boolean) => void;
}

export function QuizOverlay({ quiz, timeLimit, onAnswer }: QuizOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionColors = ['#e84393', '#3498db', '#fdcb6e', '#00b894'];

  const handleSelect = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(index, index === quiz.correctIndex);
    }, 2000);
  }, [isAnswered, quiz.correctIndex, onAnswer]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setShowResult(true);
      setTimeout(() => onAnswer(-1, false), 2000);
    }
  }, [isAnswered, onAnswer]);

  const getOptionStyle = (index: number): React.CSSProperties => {
    if (!isAnswered) {
      return {
        background: 'rgba(255,255,255,0.05)',
        border: '2px solid rgba(255,255,255,0.1)',
      };
    }
    if (index === quiz.correctIndex) {
      return {
        background: 'rgba(0,184,148,0.2)',
        border: '2px solid rgba(0,184,148,0.6)',
        boxShadow: '0 0 20px rgba(0,184,148,0.3)',
      };
    }
    if (index === selectedIndex) {
      return {
        background: 'rgba(214,48,49,0.2)',
        border: '2px solid rgba(214,48,49,0.6)',
      };
    }
    return {
      background: 'rgba(255,255,255,0.03)',
      border: '2px solid rgba(255,255,255,0.05)',
      opacity: 0.5,
    };
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
      <div style={{
        width: '100%',
        maxWidth: 'clamp(360px, 50vw, 680px)',
        animation: 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }}>
        {/* Timer */}
        <div style={{ marginBottom: 'clamp(10px, 1.5vw, 20px)' }}>
          <Timer duration={timeLimit} onComplete={handleTimeUp} isRunning={!isAnswered} size="md" />
        </div>

        {/* Question */}
        <div style={{
          padding: 'clamp(12px, 2vw, 24px)',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.1)',
          marginBottom: 'clamp(12px, 2vw, 24px)',
        }}>
          <h2 className="font-pixel" style={{ fontSize: 'clamp(8px, 1.1vw, 14px)', color: '#fff', lineHeight: 2 }}>
            {quiz.question}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(6px, 0.8vw, 12px)' }}>
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              style={{
                ...getOptionStyle(index),
                padding: 'clamp(10px, 1.5vw, 18px) clamp(12px, 1.8vw, 22px)',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: isAnswered ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="font-pixel" style={{
                fontSize: 'clamp(8px, 1vw, 12px)',
                color: optionColors[index],
                marginRight: 'clamp(6px, 0.8vw, 12px)',
                fontWeight: 'bold',
              }}>
                {optionLabels[index]}.
              </span>
              <span className="font-pixel" style={{ fontSize: 'clamp(7px, 0.85vw, 11px)', color: '#fff' }}>
                {option}
              </span>
            </button>
          ))}
        </div>

        {/* Result */}
        {showResult && (
          <div style={{
            marginTop: 'clamp(10px, 1.5vw, 20px)',
            padding: 'clamp(10px, 1.5vw, 18px)',
            borderRadius: '12px',
            textAlign: 'center',
            background: selectedIndex === quiz.correctIndex ? 'rgba(0,184,148,0.15)' : 'rgba(214,48,49,0.15)',
            border: `1px solid ${selectedIndex === quiz.correctIndex ? 'rgba(0,184,148,0.4)' : 'rgba(214,48,49,0.4)'}`,
            animation: 'slide-up 0.3s ease-out',
          }}>
            <p className="font-pixel" style={{ fontSize: 'clamp(10px, 1.4vw, 18px)', color: selectedIndex === quiz.correctIndex ? '#55efc4' : '#ff7675' }}>
              {selectedIndex === quiz.correctIndex ? '🎉 정답!' : '😢 오답!'}
            </p>
            {quiz.explanation && (
              <p className="font-pixel" style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#b8b5c8', marginTop: 'clamp(4px, 0.5vw, 8px)', lineHeight: 2 }}>
                {quiz.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
