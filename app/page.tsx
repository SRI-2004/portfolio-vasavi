import { Navigation } from '@/app/components/Navigation';
import { IntroTrailSection } from '@/app/components/IntroTrailSection';
import { PortfolioSections } from '@/app/components/PortfolioSections';
import { getFeaturedProjects } from '@/app/data/projectQueries';

const TRAIL_IMAGES = [
  '/images/trail/trail-01.svg',
  '/images/trail/trail-02.svg',
  '/images/trail/trail-03.svg',
  '/images/trail/trail-04.svg',
  '/images/trail/trail-05.svg',
];

export const revalidate = 60;

export default async function Home() {
  const projects = await getFeaturedProjects(4);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#EFEDEA]">
      <Navigation />
      <IntroTrailSection images={TRAIL_IMAGES} />
      <PortfolioSections projects={projects} />
    </div>
  );
}
