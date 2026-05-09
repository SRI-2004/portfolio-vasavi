'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/app/utils/helpers';

export function AnimatedLineBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;

    let frame = 0;

    const update = () => {
      const progress =
        window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      ref.current?.style.setProperty('--line-shift', `${progress * 180}px`);
      ref.current?.style.setProperty('--line-rotate', `${-10 + progress * 22}deg`);
      ref.current?.style.setProperty('--line-rise', `${progress * 36}px`);
      ref.current?.style.setProperty('--line-width-bump', `${progress * 18}vw`);
      ref.current?.style.setProperty('--line-height-bump', `${progress * 14}vh`);
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={ref}
      className="animated-line-bg pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
