'use client';

import { useEffect, useRef } from 'react';
import { usePointer } from '@/app/context/PointerContext';
import { isTouchDevice, prefersReducedMotion } from '@/app/utils/helpers';

export function CustomCursor() {
  const { smoothX, smoothY } = usePointer();
  const cursorRef = useRef<HTMLDivElement>(null);
  const shouldDisable = isTouchDevice() || prefersReducedMotion();

  useEffect(() => {
    if (shouldDisable || !cursorRef.current) return;

    const updateCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${smoothX.current - 20}px, ${smoothY.current - 20}px, 0)`;
      }
      requestAnimationFrame(updateCursor);
    };

    const frameId = requestAnimationFrame(updateCursor);

    return () => cancelAnimationFrame(frameId);
  }, [shouldDisable]);

  if (shouldDisable) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-50 w-10 h-10 rounded-full mix-blend-screen"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)',
        filter: 'blur(2px)',
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
      }}
    />
  );
}
