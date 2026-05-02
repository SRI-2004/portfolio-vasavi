'use client';

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

interface PointerContextType {
  x: React.MutableRefObject<number>;
  y: React.MutableRefObject<number>;
  smoothX: React.MutableRefObject<number>;
  smoothY: React.MutableRefObject<number>;
  vx: React.MutableRefObject<number>;
  vy: React.MutableRefObject<number>;
  isMoving: React.MutableRefObject<boolean>;
}

const PointerContext = createContext<PointerContextType | null>(null);

export function PointerProvider({ children }: { children: React.ReactNode }) {
  const x = useRef(0);
  const y = useRef(0);
  const smoothX = useRef(0);
  const smoothY = useRef(0);
  const vx = useRef(0);
  const vy = useRef(0);
  const isMoving = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      x.current = e.clientX;
      y.current = e.clientY;
      isMoving.current = true;

      // Calculate velocity
      vx.current = e.clientX - lastX.current;
      vy.current = e.clientY - lastY.current;

      lastX.current = e.clientX;
      lastY.current = e.clientY;

      // Clear existing timeout
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      // Set timeout to mark as not moving after 100ms
      moveTimeoutRef.current = setTimeout(() => {
        isMoving.current = false;
      }, 100);
    };

    // Smooth interpolation loop
    const rafId = setInterval(() => {
      const ease = 0.1; // Easing factor (0 = no movement, 1 = instant)
      smoothX.current += (x.current - smoothX.current) * ease;
      smoothY.current += (y.current - smoothY.current) * ease;
    }, 16); // ~60fps

    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      clearInterval(rafId);
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PointerContext.Provider value={{ x, y, smoothX, smoothY, vx, vy, isMoving }}>
      {children}
    </PointerContext.Provider>
  );
}

export function usePointer() {
  const context = useContext(PointerContext);
  if (!context) {
    throw new Error('usePointer must be used within PointerProvider');
  }
  return context;
}
