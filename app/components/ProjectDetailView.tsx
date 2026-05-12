import { Navigation } from '@/app/components/Navigation';
import { ProjectMediaBlocks } from '@/app/components/ProjectMediaBlocks';
import { PublicFooter } from '@/app/components/PublicFooter';
import {
  type Project,
  type ProjectMediaBlock,
  type ProjectSection,
} from '@/app/data/projects';

function getRenderableMedia(project: Project) {
  if (project.detail.media.length) return project.detail.media;

  const fallbackImage = project.detail.heroImage || project.cardImage;
  return [
    {
      type: 'image',
      ...fallbackImage,
      aspect: 'wide',
      caption: 'Project preview image.',
    } satisfies ProjectMediaBlock,
  ];
}

export function ProjectDetailView({ project, activeItem }: { project: Project; activeItem: ProjectSection }) {
  const media = getRenderableMedia(project);

  return (
    <div className="project-case-page public-page-shell bg-white text-[#050505]">
      <Navigation activeItem={activeItem} />

      <main className="project-case public-page-main">
        <aside className="project-case__sidebar">
          <div>
            <h1>{project.title}</h1>
            <p className="project-case__client">
              {[project.detail.client, project.detail.year].filter(Boolean).join(', ')}
            </p>
            <p className="project-case__categories">
              {(project.detail.categories || project.disciplines).join(', ')}
            </p>
          </div>

          <section className="project-case__intro">
            <h2>{project.detail.headline}</h2>
            {project.detail.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          {(project.detail.buzz?.length || project.detail.links?.length) ? (
            <section className="project-case__buzz">
              <div className="project-case__rule" aria-hidden="true" />
              {project.detail.buzz?.length ? (
                <>
                  <h2>BUZZ</h2>
                  {project.detail.buzz.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </>
              ) : null}
              {project.detail.links?.length ? (
                <div className="project-case__links">
                  {project.detail.links.map((link) => (
                    <a href={link.href} key={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {project.detail.credits?.length ? (
            <section className="project-case__credits">
              {project.detail.credits.map((credit) => (
                <p key={credit}>{credit}</p>
              ))}
            </section>
          ) : null}
        </aside>

        <section className="project-case__media" aria-label={`${project.title} media`}>
          <ProjectMediaBlocks blocks={media} prioritizeVideos />
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
