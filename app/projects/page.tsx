import { Navigation } from '@/app/components/Navigation';
import { ProjectsIndexClient } from '@/app/projects/ProjectsIndexClient';

export default function ProjectsPage() {
  return (
    <div className="projects-page min-h-screen bg-[#EFEDEA] text-[#191919]">
      <Navigation activeItem="projects" />

      <main id="projects" className="projects-page__main">
        <ProjectsIndexClient />
      </main>
    </div>
  );
}
