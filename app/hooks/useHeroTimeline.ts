import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TrailImageState } from '@/app/hooks/useImageSpawner';

interface UseHeroTimelineOptions {
  sectionRef: React.RefObject<HTMLElement | null>;
  heroRef: React.RefObject<HTMLDivElement | null>;
  imagesRef: React.RefObject<HTMLDivElement | null>;
  textRef: React.RefObject<HTMLDivElement | null>;
  trailStateRef: React.MutableRefObject<TrailImageState[]>;
  scrollProgressRef: React.MutableRefObject<number>;
  disabled?: boolean;
}

export function useHeroTimeline({
  sectionRef,
  heroRef,
  imagesRef,
  textRef,
  trailStateRef,
  scrollProgressRef,
  disabled = false,
}: UseHeroTimelineOptions) {
  useEffect(() => {
    if (
      disabled ||
      !sectionRef.current ||
      !heroRef.current ||
      !imagesRef.current ||
      !textRef.current
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const hero = heroRef.current;
    const imagesWrapper = imagesRef.current;
    const text = textRef.current;

    const ctx = gsap.context(() => {
      const imageElements = Array.from(
        imagesWrapper.querySelectorAll<HTMLElement>('[data-spawner]')
      );

      const render = (progress: number) => {
        scrollProgressRef.current = progress;

        const disperse = gsap.utils.clamp(0, 1, (progress - 0.1) / 0.65);
        const fade = gsap.utils.clamp(0, 1, (progress - 0.72) / 0.18);
        const textReveal = gsap.utils.clamp(0, 1, (progress - 0.45) / 0.4);

        gsap.set(hero, {
          scale: 1 + progress * 0.18,
          rotateX: progress * -5,
          rotateY: progress * 3,
          transformPerspective: 1400,
        });

        imageElements.forEach((img, index) => {
          const state = trailStateRef.current[index];

          if (!state?.active) {
            gsap.set(img, { opacity: 0 });
            return;
          }

          const scatterX = Math.cos(state.scatterAngle) * state.scatterDistance * disperse;
          const scatterY = Math.sin(state.scatterAngle) * state.scatterDistance * disperse;
          const z = state.depth * disperse;
          const depthScale = gsap.utils.clamp(0.68, 1.22, state.scale + (z / 1800) * disperse);

          gsap.set(img, {
            x: state.baseX + scatterX,
            y: state.baseY + scatterY,
            xPercent: -50,
            yPercent: -50,
            z,
            rotationX: state.tilt * disperse,
            rotationY: -state.tilt * 0.8 * disperse,
            rotationZ: state.rotation + state.tilt * 0.4 * disperse,
            scale: depthScale,
            opacity: 0.92 * (1 - fade),
            filter: `blur(${Math.abs(z) * 0.008 * disperse}px)`,
            transformPerspective: 1400,
            transformOrigin: '50% 50%',
          });
        });

        gsap.set(text, {
          opacity: textReveal,
          y: (1 - textReveal) * 36,
        });
      };

      render(0);

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [sectionRef, heroRef, imagesRef, textRef, trailStateRef, scrollProgressRef, disabled]);
}
