'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/app/components/Navigation';
import { CustomCursor } from '@/app/components/CustomCursor';
import { PinnedHeroScene } from '@/app/components/PinnedHeroScene';
import { preloadImages } from '@/app/utils/helpers';

// Trail image paths - these will be loaded from public/images/trail/
const TRAIL_IMAGES = [
  '/images/trail/trail-01.svg',
  '/images/trail/trail-02.svg',
  '/images/trail/trail-03.svg',
  '/images/trail/trail-04.svg',
  '/images/trail/trail-05.svg',
];

export default function Home() {
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    // Preload images
    preloadImages([...TRAIL_IMAGES]).then(() => {
      setImagesReady(true);
    });
  }, []);

  return (
    <div className="flex flex-col bg-white">
      <Navigation />
      <CustomCursor />
      <PinnedHeroScene images={TRAIL_IMAGES} name="Portfolio" tagline="Design & Visual Work" />
    </div>
  );
}
