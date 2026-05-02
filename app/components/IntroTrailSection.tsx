'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { useHeroTimeline } from '@/app/hooks/useHeroTimeline';
import { useImageSpawner, type TrailImageState } from '@/app/hooks/useImageSpawner';
import { usePointer } from '@/app/context/PointerContext';
import { isTouchDevice, prefersReducedMotion, preloadImages } from '@/app/utils/helpers';
import { introConfig } from '@/app/config/introConfig';

interface IntroTrailSectionProps {
  images: string[];
}

const ABOUT_LINES = [
  'Vasavi Sridhar is a inter-disciplinary design futurist, whose practice seamlessly integrates biodesign, material innovation, and systems design.',
  'Her unique approach combines digital and hands-on techniques,',
];

export function IntroTrailSection({ images }: IntroTrailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introCopyRef = useRef<HTMLDivElement>(null);
  const stageGridRef = useRef<HTMLDivElement>(null);
  const stageGlowRef = useRef<HTMLDivElement>(null);
  const pointerImagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollLabelRef = useRef<HTMLDivElement>(null);
  const pointerTrailStateRef = useRef<TrailImageState[]>([]);
  const scrollProgressRef = useRef(0);
  const isDisabled = prefersReducedMotion() || isTouchDevice();
  const { x, y, isMoving } = usePointer();

  const introVars = {
    '--content-max': introConfig.cssVars.contentMax,
    '--page-gutter': introConfig.cssVars.pageGutter,
    '--nav-height': introConfig.cssVars.navHeight,
    '--nav-pill-height': introConfig.cssVars.navPillHeight,
    '--intro-stage-max': introConfig.cssVars.stageMax,
    '--intro-stage-height': introConfig.cssVars.stageHeight,
    '--intro-card-width': introConfig.cssVars.cardWidth,
    '--intro-radius': introConfig.cssVars.stageRadius,
  } as CSSProperties;

  const { spawnImage } = useImageSpawner({
    imagesRef: pointerImagesRef,
    boundsRef: stageRef,
    trailStateRef: pointerTrailStateRef,
    scrollProgressRef,
    maxImages: introConfig.pointerTrail.poolSize,
  });

  useEffect(() => {
    preloadImages(images);
  }, [images]);

  useEffect(() => {
    if (isDisabled) return;

    let frameId = 0;
    let lastSpawnTime = 0;

    const handleSpawn = (time: number) => {
      if (isMoving.current && time - lastSpawnTime > introConfig.pointerTrail.minSpawnMs) {
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
    frameRef,
    heroRef: stageRef,
    introCopyRef,
    stageGridRef,
    stageGlowRef,
    pointerImagesRef,
    textRef,
    scrollLabelRef,
    pointerTrailStateRef,
    scrollProgressRef,
    disabled: isDisabled,
  });

  return (
    <section id="top" ref={sectionRef} className="relative bg-[#EFEDEA]" style={introVars}>
      <div
        ref={frameRef}
        className="intro-frame"
      >
        <div className="page-shell intro-stack">
          <div
            ref={introCopyRef}
            className="intro-caption"
          >
            <p>
              Biodesign, material innovation, and immersive systems research.
            </p>
          </div>

          <div className="intro-stage-wrap">
            <div
              ref={stageRef}
              className="intro-stage"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div ref={stageGridRef} className="absolute inset-0 opacity-100">
                <div className="intro-grid h-full w-full" />
              </div>
              <div
                ref={stageGlowRef}
                className="absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(7,85,187,0.16),transparent_34%),linear-gradient(125deg,rgba(255,255,255,0.22),transparent_42%)]"
              />

              <div
                ref={pointerImagesRef}
                className="absolute inset-0 z-20 pointer-events-none"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {Array.from({ length: introConfig.pointerTrail.poolSize }, (_, idx) => {
                  const img = images[idx % images.length];

                  return (
                    <div
                      key={`pointer-${idx}`}
                      data-pointer-card
                      className="trail-card"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <img
                        src={img}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            ref={scrollLabelRef}
            className="intro-scroll-label"
          >
            <span className="h-px bg-[#191919]/18" />
            <span>Scroll to Explore</span>
            <span className="h-px bg-[#191919]/18" />
          </div>
        </div>

        <div
          ref={textRef}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-[var(--page-gutter)] text-[#191919]"
          style={isDisabled ? { opacity: 1 } : { opacity: 0, transform: 'translateY(28px)' }}
        >
          <div className="max-w-5xl py-4 text-center">
            <p className="text-[clamp(1.85rem,3vw,3.8rem)] font-medium leading-[1.04]">
              {ABOUT_LINES[0]}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#191919]/62 md:text-lg">
              {ABOUT_LINES[1]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
