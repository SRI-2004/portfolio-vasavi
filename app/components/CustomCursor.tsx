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
        cursorRef.current.style.transform = `translate3d(${smoothX.current - 13}px, ${smoothY.current - 13}px, 0)`;
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
      className="pointer-events-none fixed top-0 left-0 z-50 h-[26px] w-[26px] rounded-full"
      style={{
        border: '1.5px solid rgba(5, 5, 5, 0.72)',
        background: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.45)',
        mixBlendMode: 'difference',
      }}
    />
  );
}
