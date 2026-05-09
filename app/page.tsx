import { Navigation } from '@/app/components/Navigation';
import { IntroTrailSection } from '@/app/components/IntroTrailSection';
import { PortfolioSections } from '@/app/components/PortfolioSections';

const TRAIL_IMAGES = [
  '/images/trail/trail-01.svg',
  '/images/trail/trail-02.svg',
  '/images/trail/trail-03.svg',
  '/images/trail/trail-04.svg',
  '/images/trail/trail-05.svg',
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#EFEDEA]">
      <Navigation />
      <IntroTrailSection images={TRAIL_IMAGES} />
      <PortfolioSections />
    </div>
  );
}
