import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { introConfig } from '@/app/config/introConfig';

export interface TrailImageState {
  active: boolean;
  baseX: number;
  baseY: number;
  rotation: number;
  scale: number;
  scatterAngle: number;
  scatterDistance: number;
  scatterX?: number;
  scatterY?: number;
  depth: number;
  tilt: number;
}

interface UseImageSpawnerOptions {
  imagesRef: React.RefObject<HTMLDivElement | null>;
  boundsRef?: React.RefObject<HTMLElement | null>;
  trailStateRef: React.MutableRefObject<TrailImageState[]>;
  scrollProgressRef: React.MutableRefObject<number>;
  maxImages: number;
}

export function useImageSpawner({
  imagesRef,
  boundsRef,
  trailStateRef,
  scrollProgressRef,
  maxImages,
}: UseImageSpawnerOptions) {
  const lastSpawnPos = useRef({ x: 0, y: 0 });
  const currentIndexRef = useRef(0);
  const hasSpawnedRef = useRef(false);

  const spawnImage = useCallback(
    (x: number, y: number) => {
      if (scrollProgressRef.current >= introConfig.pointerTrail.progressCutoff) {
        return;
      }

      const bounds = boundsRef?.current?.getBoundingClientRect();
      const localX = bounds ? x - bounds.left : x;
      const localY = bounds ? y - bounds.top : y;

      if (bounds && (localX < 0 || localY < 0 || localX > bounds.width || localY > bounds.height)) {
        return;
      }

      const lastX = lastSpawnPos.current.x;
      const lastY = lastSpawnPos.current.y;
      const distance = Math.sqrt(Math.pow(localX - lastX, 2) + Math.pow(localY - lastY, 2));

      if (
        (hasSpawnedRef.current && distance < introConfig.pointerTrail.spawnThreshold) ||
        !imagesRef.current
      ) {
        return;
      }

      lastSpawnPos.current = { x: localX, y: localY };
      hasSpawnedRef.current = true;

      const elements = imagesRef.current.querySelectorAll<HTMLElement>('[data-pointer-card]');
      const index = currentIndexRef.current;
      const element = elements[index];

      if (element) {
        const width = bounds?.width ?? window.innerWidth;
        const height = bounds?.height ?? window.innerHeight;
        const pointerAngle = Math.atan2(localY - height / 2, localX - width / 2);
        const fallbackAngle = (index / Math.max(maxImages, 1)) * Math.PI * 2;
        const scatterAngle = Number.isFinite(pointerAngle)
          ? pointerAngle + (Math.random() - 0.5) * 0.85
          : fallbackAngle;
        const rotation = 0;
        const scale = 0.96 + Math.random() * 0.14;

        trailStateRef.current[index] = {
          active: true,
          baseX: localX,
          baseY: localY,
          rotation,
          scale,
          scatterAngle,
          scatterDistance: 520 + Math.random() * 420,
          depth: -260 + Math.random() * 620,
          tilt: 0,
        };

        gsap.killTweensOf(element);
        gsap.set(element, {
          x: localX,
          y: localY,
          xPercent: -50,
          yPercent: -50,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          filter: 'blur(0px)',
          opacity: 0,
          transformOrigin: '50% 50%',
          transformPerspective: 1400,
        });

        gsap.fromTo(
          element,
          {
            rotation: 0,
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
    [boundsRef, imagesRef, maxImages, scrollProgressRef, trailStateRef]
  );

  return { spawnImage };
}
