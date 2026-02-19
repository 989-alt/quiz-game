import React, { useEffect, useRef, useCallback } from 'react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
}

export function MobileControls({ onMove }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const centerPos = useRef({ x: 0, y: 0 });

  const maxDistance = 40;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;

    isDragging.current = true;
    const rect = joystickRef.current.getBoundingClientRect();
    centerPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current || !knobRef.current) return;

    const deltaX = clientX - centerPos.current.x;
    const deltaY = clientY - centerPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, maxDistance);

    let normalizedX = 0;
    let normalizedY = 0;

    if (distance > 0) {
      normalizedX = (deltaX / distance) * clampedDistance;
      normalizedY = (deltaY / distance) * clampedDistance;

      // Send normalized input (-1 to 1)
      onMove(normalizedX / maxDistance, normalizedY / maxDistance);
    }

    // Update knob position
    knobRef.current.style.transform = `translate(${normalizedX}px, ${normalizedY}px)`;
  }, [onMove]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (joystickRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div className="absolute bottom-8 left-8 pointer-events-auto">
      <div
        ref={joystickRef}
        className="w-32 h-32 rounded-full bg-gray-800/60 border-4 border-gray-600/60 flex items-center justify-center"
        style={{ touchAction: 'none' }}
      >
        <div
          ref={knobRef}
          className="w-16 h-16 rounded-full bg-gray-400/80 border-2 border-white/50 shadow-lg transition-transform duration-75"
        />
      </div>
    </div>
  );
}
