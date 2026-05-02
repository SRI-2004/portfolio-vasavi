'use client';

import { useRef, useEffect } from 'react';
import { useHeroTimeline } from '@/app/hooks/useHeroTimeline';
import { prefersReducedMotion, isTouchDevice } from '@/app/utils/helpers';
import { usePointer } from '@/app/context/PointerContext';
import { useImageSpawner, type TrailImageState } from '@/app/hooks/useImageSpawner';

interface PinnedHeroSceneProps {
  images: string[];
  name: string;
  tagline: string;
}

export function PinnedHeroScene({ images, name, tagline }: PinnedHeroSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const trailStateRef = useRef<TrailImageState[]>([]);
  const scrollProgressRef = useRef(0);
  const isDisabled = prefersReducedMotion() || isTouchDevice();

  const { x, y, isMoving } = usePointer();
  const { spawnImage } = useImageSpawner({
    imagesRef,
    trailStateRef,
    scrollProgressRef,
    spawnThreshold: 120,
    maxImages: images.length,
  });

  useEffect(() => {
    if (isDisabled) return;

    let frameId = 0;
    let lastSpawnTime = 0;

    const handleSpawn = (time: number) => {
      if (isMoving.current && time - lastSpawnTime > 42) {
        spawnImage(x.current, y.current);
        lastSpawnTime = time;
      }

      frameId = requestAnimationFrame(handleSpawn);
    };

    frameId = requestAnimationFrame(handleSpawn);

    return () => cancelAnimationFrame(frameId);
  }, [x, y, isMoving, spawnImage, isDisabled]);

  useHeroTimeline({
    sectionRef,
    heroRef,
    imagesRef,
    textRef,
    trailStateRef,
    scrollProgressRef,
    disabled: isDisabled,
  });

  return (
    <section ref={sectionRef} className="relative min-h-[380vh] bg-white">
      <div
        ref={heroRef}
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-white"
        style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
      >
        <div
          ref={imagesRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              data-spawner
              className="absolute left-0 top-0 h-[18rem] w-[14rem] transition-none opacity-0 will-change-transform md:h-[24rem] md:w-[18rem] lg:h-[30rem] lg:w-[23rem]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={img}
                alt={`trail-${idx}`}
                className="w-full h-full object-cover rounded-none shadow-2xl"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div
          ref={textRef}
          className="relative z-10 text-center pointer-events-none max-w-5xl px-6"
          style={isDisabled ? { opacity: 1 } : { opacity: 0, transform: 'translateY(20px)' }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.18em] mb-5 text-black uppercase">
            {name}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-light tracking-[0.28em] text-gray-600 uppercase">
            {tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
