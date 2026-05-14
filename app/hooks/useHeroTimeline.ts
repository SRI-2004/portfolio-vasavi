import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TrailImageState } from '@/app/hooks/useImageSpawner';
import { introConfig } from '@/app/config/introConfig';

interface UseHeroTimelineOptions {
  sectionRef: React.RefObject<HTMLElement | null>;
  frameRef?: React.RefObject<HTMLDivElement | null>;
  heroRef: React.RefObject<HTMLDivElement | null>;
  stageGridRef?: React.RefObject<HTMLDivElement | null>;
  stageGlowRef?: React.RefObject<HTMLDivElement | null>;
  pointerImagesRef: React.RefObject<HTMLDivElement | null>;
  scrollLabelRef?: React.RefObject<HTMLDivElement | null>;
  pointerTrailStateRef: React.MutableRefObject<TrailImageState[]>;
  scrollProgressRef: React.MutableRefObject<number>;
  disabled?: boolean;
}

export function useHeroTimeline({
  sectionRef,
  frameRef,
  heroRef,
  stageGridRef,
  stageGlowRef,
  pointerImagesRef,
  scrollLabelRef,
  pointerTrailStateRef,
  scrollProgressRef,
  disabled = false,
}: UseHeroTimelineOptions) {
  useEffect(() => {
    if (
      disabled ||
      !sectionRef.current ||
      !heroRef.current ||
      !pointerImagesRef.current
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const frame = frameRef?.current;
    const hero = heroRef.current;
    const stageGrid = stageGridRef?.current;
    const stageGlow = stageGlowRef?.current;
    const pointerImagesWrapper = pointerImagesRef.current;
    const scrollLabel = scrollLabelRef?.current;

    const ctx = gsap.context(() => {
      const pointerImageElements = Array.from(
        pointerImagesWrapper.querySelectorAll<HTMLElement>('[data-pointer-card]')
      );

      const render = (progress: number) => {
        scrollProgressRef.current = progress;

        const { timeline } = introConfig;
        const depth = gsap.utils.clamp(0, 1, progress / timeline.depthEnd);
        const disperse = gsap.utils.clamp(
          0,
          1,
          (progress - timeline.disperseStart) / timeline.disperseDuration
        );
        const fade = gsap.utils.clamp(
          0,
          1,
          (progress - timeline.fadeStart) / timeline.fadeDuration
        );
        const chromeFade = gsap.utils.clamp(
          0,
          1,
          (progress - timeline.chromeFadeStart) / timeline.chromeFadeDuration
        );

        gsap.set(hero, {
          scale: 1 + depth * 0.04 + chromeFade * 0.035,
          rotateX: depth * -3.5,
          rotateY: depth * 2,
          borderColor: `rgba(25, 25, 25, ${0.12 * (1 - chromeFade)})`,
          borderRadius: `${22 - chromeFade * 10}px`,
          backgroundColor: `rgba(255, 255, 255, ${0.4 * (1 - chromeFade)})`,
          boxShadow: `0 ${26 * (1 - chromeFade)}px ${80 * (1 - chromeFade)}px rgba(25,25,25,${0.08 * (1 - chromeFade)})`,
          transformPerspective: 1400,
        });

        if (stageGrid) {
          gsap.set(stageGrid, {
            opacity: 1 - chromeFade,
          });
        }

        if (stageGlow) {
          gsap.set(stageGlow, {
            opacity: 1 - chromeFade,
          });
        }

        const renderCards = (
          elements: HTMLElement[],
          states: React.MutableRefObject<TrailImageState[]>,
          opacity = 0.92
        ) => {
          elements.forEach((img, index) => {
            const state = states.current[index];
            if (!state?.active) {
              gsap.set(img, { opacity: 0 });
              return;
            }

            const targetScatterX =
              state.scatterX ?? Math.cos(state.scatterAngle) * state.scatterDistance;
            const targetScatterY =
              state.scatterY ?? Math.sin(state.scatterAngle) * state.scatterDistance;
            const scatterX = targetScatterX * disperse * timeline.scatterMultiplier;
            const scatterY = targetScatterY * disperse * timeline.scatterMultiplier;
            const z = state.depth * (0.35 + depth * 0.95) + (index - 2) * 110 * depth;
            const depthScale = gsap.utils.clamp(
              0.56,
              1.42,
              state.scale + depth * 0.18 + (z / 1300) * disperse
            );

            gsap.set(img, {
              x: state.baseX + scatterX,
              y: state.baseY + scatterY,
              xPercent: -50,
              yPercent: -50,
              z,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              scale: depthScale,
              opacity: opacity * (1 - fade),
              filter: `blur(${Math.abs(z) * 0.004 * depth + fade * 5}px)`,
              zIndex: state.zIndex ?? index,
              transformPerspective: 1400,
              transformOrigin: '50% 50%',
            });
          });
        };

        renderCards(pointerImageElements, pointerTrailStateRef, 0.82);

        if (scrollLabel) {
          const scrollLabelFade = gsap.utils.clamp(
            0,
            1,
            (progress - timeline.scrollLabelFadeStart) / timeline.scrollLabelFadeDuration
          );

          gsap.set(scrollLabel, {
            opacity: 1 - scrollLabelFade,
            y: scrollLabelFade * timeline.scrollLabelOffset,
          });
        }
      };

      render(0);

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: frame ? introConfig.timeline.pinDistance : 'bottom bottom',
        pin: frame || undefined,
        pinSpacing: Boolean(frame),
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [
    sectionRef,
    frameRef,
    heroRef,
    stageGridRef,
    stageGlowRef,
    pointerImagesRef,
    scrollLabelRef,
    pointerTrailStateRef,
    scrollProgressRef,
    disabled,
  ]);
}
