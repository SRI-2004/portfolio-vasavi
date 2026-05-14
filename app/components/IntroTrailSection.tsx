'use client';

import { type CSSProperties, type SyntheticEvent, useEffect, useRef, useState } from 'react';
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

const PHONE_CARD_POSITIONS = [
  { left: '7%', top: '9%', width: '46%' },
  { left: '43%', top: '16%', width: '43%' },
  { left: '17%', top: '36%', width: '42%' },
  { left: '51%', top: '46%', width: '39%' },
  { left: '10%', top: '60%', width: '48%' },
];

function applyTrailCardRatio(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  const parent = image.parentElement;
  const { naturalWidth, naturalHeight } = image;

  if (!parent || !naturalWidth || !naturalHeight) return;
  parent.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
}

export function IntroTrailSection({ images }: IntroTrailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageGridRef = useRef<HTMLDivElement>(null);
  const stageGlowRef = useRef<HTMLDivElement>(null);
  const pointerImagesRef = useRef<HTMLDivElement>(null);
  const scrollLabelRef = useRef<HTMLDivElement>(null);
  const pointerTrailStateRef = useRef<TrailImageState[]>([]);
  const scrollProgressRef = useRef(0);
  const [isPhone, setIsPhone] = useState(false);
  const [phoneVisibleImages, setPhoneVisibleImages] = useState<number[]>([]);
  const phoneImageIndexRef = useRef(0);
  const isDisabled = prefersReducedMotion() || isTouchDevice() || isPhone;
  const { x, y, isMoving } = usePointer();

  const introVars = {
    '--content-max': introConfig.cssVars.contentMax,
    '--page-gutter': introConfig.cssVars.pageGutter,
    '--nav-height': introConfig.cssVars.navHeight,
    '--nav-pill-height': introConfig.cssVars.navPillHeight,
    '--intro-stage-max': introConfig.cssVars.stageMax,
    '--intro-stage-aspect': introConfig.cssVars.stageAspect,
    '--intro-stage-available-height': introConfig.cssVars.stageAvailableHeight,
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
    const media = window.matchMedia('(max-width: 767px)');
    const updatePhoneMode = () => setIsPhone(media.matches);

    updatePhoneMode();
    media.addEventListener('change', updatePhoneMode);

    return () => media.removeEventListener('change', updatePhoneMode);
  }, []);

  useEffect(() => {
    if (!isPhone || !images.length) {
      setPhoneVisibleImages([]);
      phoneImageIndexRef.current = 0;
      return;
    }

    phoneImageIndexRef.current = 0;
    setPhoneVisibleImages([0]);

    const timer = window.setInterval(() => {
      if (phoneImageIndexRef.current >= images.length - 1) {
        window.clearInterval(timer);
        return;
      }

      phoneImageIndexRef.current += 1;
      const nextImageIndex = phoneImageIndexRef.current;

      setPhoneVisibleImages((currentImages) =>
        [...currentImages, nextImageIndex].slice(-introConfig.pointerTrail.visibleLimit)
      );
    }, 650);

    return () => window.clearInterval(timer);
  }, [images.length, isPhone]);

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
    scrollLabelRef,
    pointerTrailStateRef,
    scrollProgressRef,
    disabled: isDisabled,
  });

  if (isPhone) {
    return (
      <section id="top" ref={sectionRef} className="relative bg-white" style={introVars}>
        <div className="phone-intro">
          <div className="phone-trail" aria-hidden="true">
            {phoneVisibleImages.map((imageSequence) => {
              const image = images[imageSequence];
              const position = PHONE_CARD_POSITIONS[imageSequence % PHONE_CARD_POSITIONS.length];

              return (
                <div
                  key={`phone-trail-${imageSequence}`}
                  className="phone-trail-card"
                  style={{
                    ...position,
                    zIndex: imageSequence,
                  }}
                >
                  <img
                    src={image}
                    alt=""
                    draggable={false}
                    onLoad={applyTrailCardRatio}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <AboutSection />
      </section>
    );
  }

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
                        onLoad={applyTrailCardRatio}
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
      </div>

      <AboutSection />
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="about-reveal">
        <div className="about-copy">
          <p className="about-kicker">About</p>
          <div className="about-copy-desktop">
            <p className="about-heading">{ABOUT_LINES[0]}</p>
            <p className="about-support">{ABOUT_LINES[1]}</p>
          </div>
          <div className="about-copy-phone">
            {ABOUT_LINES.map((line, index) => (
              <p className={`about-phone-line about-phone-line--${index === 0 ? 'primary' : 'secondary'}`} key={line}>
                {line}
              </p>
            ))}
          </div>
          <a className="resume-button" href={resumeUrl} download>
            RESUME
          </a>
        </div>

        <div className="about-image-wrap">
          <img
            src="/images/about-crystal-dress.svg"
            alt="Crystal and black sculptural textile form"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
