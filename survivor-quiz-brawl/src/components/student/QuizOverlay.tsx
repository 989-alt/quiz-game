import React, { useState, useEffect } from 'react';
import { Timer } from '../shared/Timer';
import { PixelButton } from '../shared/PixelButton';
import type { Quiz } from '../../types/quiz';

interface QuizOverlayProps {
  quiz: Quiz;
  timeLimit: number;
  onAnswer: (selectedIndex: number, timeSpent: number) => void;
}

export function QuizOverlay({ quiz, timeLimit, onAnswer }: QuizOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (isAnswered) return;

    setSelectedIndex(index);
    setIsAnswered(true);
    setShowResult(true);

    const timeSpent = (Date.now() - startTime) / 1000;

    // Show result for a moment then callback
    setTimeout(() => {
      onAnswer(index, timeSpent);
    }, 1500);
  };

  const handleTimeUp = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setShowResult(true);
      const timeSpent = timeLimit;

      setTimeout(() => {
        onAnswer(-1, timeSpent); // -1 indicates no answer
      }, 1500);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index
        ? 'bg-blue-600 border-blue-400'
        : 'bg-gray-700 border-gray-500 hover:bg-gray-600';
    }

    if (index === quiz.correctIndex) {
      return 'bg-green-600 border-green-400 animate-pulse';
    }

    if (selectedIndex === index && index !== quiz.correctIndex) {
      return 'bg-red-600 border-red-400 animate-shake';
    }

    return 'bg-gray-700 border-gray-500 opacity-50';
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-pixel-dark border-4 border-pixel-purple rounded-lg p-6 max-w-2xl w-full mx-4 animate-float">
        {/* Timer */}
        <div className="mb-4">
          <Timer
            duration={timeLimit}
            onComplete={handleTimeUp}
            isRunning={!isAnswered}
            size="md"
          />
        </div>

        {/* Question */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-white font-pixel text-lg leading-relaxed">
            {quiz.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${getOptionStyle(index)}
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center">
                <span className="text-white font-pixel text-sm mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-white font-pixel text-sm">
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Result Message */}
        {showResult && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            selectedIndex === quiz.correctIndex
              ? 'bg-green-900/50 border border-green-500'
              : 'bg-red-900/50 border border-red-500'
          }`}>
            <p className={`font-pixel text-lg ${
              selectedIndex === quiz.correctIndex ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedIndex === quiz.correctIndex ? '정답!' : '오답!'}
            </p>
            {quiz.explanation && (
              <p className="text-gray-300 font-pixel text-xs mt-2">
                {quiz.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
