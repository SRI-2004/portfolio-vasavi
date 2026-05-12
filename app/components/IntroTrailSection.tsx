'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { useHeroTimeline } from '@/app/hooks/useHeroTimeline';
import { useImageSpawner, type TrailImageState } from '@/app/hooks/useImageSpawner';
import { usePointer } from '@/app/context/PointerContext';
import { isTouchDevice, prefersReducedMotion, preloadImages } from '@/app/utils/helpers';
import { introConfig } from '@/app/config/introConfig';
import { resumeUrl } from '@/app/config/siteAssets';

interface IntroTrailSectionProps {
  images: string[];
}

const ABOUT_LINES = [
  'Vasavi Sridhar is an inter-disciplinary designer whose practice seamlessly integrates emerging materials, textile systems, and sustainable strategies.',
  'Her unique approach is research-led, weaving biodesign, material innovation, and fashion, anchored by a strong foundation in visual storytelling.',
];

export function IntroTrailSection({ images }: IntroTrailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
    <section id="top" ref={sectionRef} className="relative bg-white" style={introVars}>
      <div
        ref={frameRef}
        className="intro-frame"
      >
        <div className="page-shell intro-stack">
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
          id="about"
          ref={textRef}
          className={`about-transition pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-[var(--page-gutter)] text-white${isDisabled ? ' about-transition--static' : ''}`}
          style={isDisabled ? { opacity: 1, transform: 'none' } : { opacity: 0, transform: 'translateY(28px)' }}
        >
          <div className="about-reveal">
            <div className="about-copy" data-about-copy>
              <p className="about-kicker" data-about-line>
                About
              </p>
              <p className="about-heading" data-about-line>
                {ABOUT_LINES[0]}
              </p>
              <p className="about-support" data-about-line>
                {ABOUT_LINES[1]}
              </p>
              <a className="resume-button pointer-events-auto" href={resumeUrl} download data-about-action>
                RESUME
              </a>
            </div>

            <div className="about-image-wrap" data-about-image>
              <img
                src="/images/about-crystal-dress.svg"
                alt="Crystal and black sculptural textile form"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
