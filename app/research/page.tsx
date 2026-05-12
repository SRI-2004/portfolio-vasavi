import { Navigation } from '@/app/components/Navigation';
import { PublicFooter } from '@/app/components/PublicFooter';
import { getPublishedProjects } from '@/app/data/projectQueries';
import { ProjectsIndexClient } from '@/app/projects/ProjectsIndexClient';

export const revalidate = 60;

export default async function ResearchPage() {
  const projects = await getPublishedProjects('research');

  return (
    <div className="projects-page public-page-shell bg-white text-[#191919]">
      <Navigation activeItem="research" />

      <main id="research" className="projects-page__main public-page-main">
        <ProjectsIndexClient projects={projects} basePath="/research" />
      </main>

      <PublicFooter />
    </div>
  );
}
