import { useRef, useCallback } from 'react';
import gsap from 'gsap';

export interface TrailImageState {
  active: boolean;
  baseX: number;
  baseY: number;
  rotation: number;
  scale: number;
  scatterAngle: number;
  scatterDistance: number;
  depth: number;
  tilt: number;
}

interface UseImageSpawnerOptions {
  imagesRef: React.RefObject<HTMLDivElement | null>;
  trailStateRef: React.MutableRefObject<TrailImageState[]>;
  scrollProgressRef: React.MutableRefObject<number>;
  spawnThreshold?: number;
  maxImages: number;
}

export function useImageSpawner({
  imagesRef,
  trailStateRef,
  scrollProgressRef,
  spawnThreshold = 30,
  maxImages,
}: UseImageSpawnerOptions) {
  const lastSpawnPos = useRef({ x: 0, y: 0 });
  const currentIndexRef = useRef(0);
  const hasSpawnedRef = useRef(false);

  const spawnImage = useCallback(
    (x: number, y: number) => {
      if (scrollProgressRef.current >= 0.85) {
        return;
      }

      const lastX = lastSpawnPos.current.x;
      const lastY = lastSpawnPos.current.y;
      const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));

      if ((hasSpawnedRef.current && distance < spawnThreshold) || !imagesRef.current) {
        return;
      }

      lastSpawnPos.current = { x, y };
      hasSpawnedRef.current = true;

      const elements = imagesRef.current.querySelectorAll<HTMLElement>('[data-spawner]');
      const index = currentIndexRef.current;
      const element = elements[index];

      if (element) {
        const viewportXCenter = window.innerWidth / 2;
        const viewportYCenter = window.innerHeight / 2;
        const pointerAngle = Math.atan2(y - viewportYCenter, x - viewportXCenter);
        const fallbackAngle = (index / Math.max(maxImages, 1)) * Math.PI * 2;
        const scatterAngle = Number.isFinite(pointerAngle)
          ? pointerAngle + (Math.random() - 0.5) * 0.85
          : fallbackAngle;
        const rotation = (Math.random() - 0.5) * 22;
        const scale = 0.96 + Math.random() * 0.14;

        trailStateRef.current[index] = {
          active: true,
          baseX: x,
          baseY: y,
          rotation,
          scale,
          scatterAngle,
          scatterDistance: 620 + Math.random() * 420,
          depth: -260 + Math.random() * 620,
          tilt: 10 + Math.random() * 20,
        };

        gsap.killTweensOf(element);
        gsap.set(element, {
          x,
          y,
          xPercent: -50,
          yPercent: -50,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: rotation,
          filter: 'blur(0px)',
          opacity: 0,
          transformOrigin: '50% 50%',
          transformPerspective: 1400,
        });

        gsap.fromTo(
          element,
          {
            rotation: rotation,
            scale: scale * 0.72,
            opacity: 0,
          },
          {
            scale: scale,
            opacity: 0.92,
            duration: 0.32,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );
      }

      currentIndexRef.current = (currentIndexRef.current + 1) % maxImages;
    },
    [imagesRef, maxImages, scrollProgressRef, spawnThreshold, trailStateRef]
  );

  return { spawnImage };
}
