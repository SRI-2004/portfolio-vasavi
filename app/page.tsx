import { Navigation } from '@/app/components/Navigation';
import { IntroTrailSection } from '@/app/components/IntroTrailSection';
import { PortfolioSections } from '@/app/components/PortfolioSections';
import { PublicFooter } from '@/app/components/PublicFooter';
import { getFeaturedProjects } from '@/app/data/projectQueries';

const TRAIL_IMAGES = [
  '/images/trail/trail-01.svg',
  '/images/trail/trail-02.svg',
  '/images/trail/trail-03.svg',
  '/images/trail/trail-04.svg',
  '/images/trail/trail-05.svg',
  '/images/trail/trail-06.svg',
  '/images/trail/trail-07.svg',
  '/images/trail/trail-08.svg',
  '/images/trail/trail-09.svg',
  '/images/trail/trail-10.svg',
];

export const revalidate = 60;

export default async function Home() {
  const projects = await getFeaturedProjects(4);

  return (
    <div className="public-page-shell relative overflow-x-hidden bg-white">
      <Navigation />
      <IntroTrailSection images={TRAIL_IMAGES} />
      <PortfolioSections projects={projects} />
      <PublicFooter />
    </div>
  );
}
