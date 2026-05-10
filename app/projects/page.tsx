import { Navigation } from '@/app/components/Navigation';
import { getPublishedProjects } from '@/app/data/projectQueries';
import { ProjectsIndexClient } from '@/app/projects/ProjectsIndexClient';

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="projects-page min-h-screen bg-[#EFEDEA] text-[#191919]">
      <Navigation activeItem="projects" />

      <main id="projects" className="projects-page__main">
        <ProjectsIndexClient projects={projects} />
      </main>
    </div>
  );
}
