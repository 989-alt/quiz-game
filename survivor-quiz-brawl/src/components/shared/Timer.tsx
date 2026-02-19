import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  isRunning?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({
  duration,
  onComplete,
  isRunning = true,
  showProgress = true,
  size = 'md',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        return next < 0 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= duration * 0.25;

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`font-pixel ${textSizeStyles[size]} ${isLow ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      {showProgress && (
        <div className={`w-full bg-gray-700 rounded-full ${sizeStyles[size]} overflow-hidden`}>
          <div
            className={`h-full transition-all duration-100 ${
              isLow ? 'bg-red-500' : progress > 50 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
