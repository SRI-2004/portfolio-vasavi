import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/app/components/Navigation';
import { getProjectBySlug } from '@/app/data/projectQueries';
import {
  type Project,
  type ProjectImage,
  type ProjectMediaBlock,
  type ProjectVideo,
} from '@/app/data/projects';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project not found | Vasavi Sridhar',
    };
  }

  return {
    title: `${project.title} | Vasavi Sridhar`,
    description: project.detail.headline,
  };
}

function getEmbedUrl(video: ProjectVideo) {
  if (video.provider === 'youtube') {
    if (video.url.includes('/embed/')) return video.url;
    const watchId = video.url.match(/[?&]v=([^&]+)/)?.[1];
    const shortId = video.url.match(/youtu\.be\/([^?]+)/)?.[1];
    const videoId = watchId || shortId;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : video.url;
  }

  if (video.provider === 'vimeo') {
    if (video.url.includes('player.vimeo.com')) return video.url;
    const videoId = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : video.url;
  }

  return video.url;
}

function ProjectVideoBlock({ video }: { video: ProjectVideo }) {
  if (video.provider === 'file') {
    if (!video.url) {
      return video.poster ? (
        <img className="project-case__media-img" src={video.poster} alt={video.title || 'Project video poster'} />
      ) : null;
    }

    return (
      <video
        className="project-case__video"
        src={video.url}
        poster={video.poster}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <iframe
      className="project-case__video"
      src={getEmbedUrl(video)}
      title={video.title || 'Project video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function ImageBlock({ image }: { image: ProjectImage }) {
  return (
    <figure className="project-case__figure" data-aspect={image.aspect || 'wide'}>
      <img className="project-case__media-img" src={image.src} alt={image.alt} />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

function GalleryBlock({ block }: { block: Extract<ProjectMediaBlock, { type: 'gallery' }> }) {
  if (!block.items.length) return null;

  return (
    <section className="project-case__gallery" data-layout={block.layout || 'grid'}>
      {block.title ? <h2>{block.title}</h2> : null}
      <div className="project-case__gallery-grid">
        {block.items.map((item, index) => (
          <ImageBlock image={item} key={`${item.src}-${index}`} />
        ))}
      </div>
    </section>
  );
}

function TextBlock({ block }: { block: Extract<ProjectMediaBlock, { type: 'text' }> }) {
  return (
    <section className="project-case__text-block">
      {block.eyebrow ? <p>{block.eyebrow}</p> : null}
      {block.title ? <h2>{block.title}</h2> : null}
      {block.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}

function MediaBlock({ block }: { block: ProjectMediaBlock }) {
  if (block.type === 'video') {
    return (
      <div className="project-case__video-frame">
        <ProjectVideoBlock video={block} />
      </div>
    );
  }

  if (block.type === 'image') return <ImageBlock image={block} />;
  if (block.type === 'gallery') return <GalleryBlock block={block} />;
  return <TextBlock block={block} />;
}

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

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const media = getRenderableMedia(project);
  const videoBlocks = media.filter((block) => block.type === 'video');
  const remainingBlocks = media.filter((block) => block.type !== 'video');
  const orderedMedia = [...videoBlocks, ...remainingBlocks];

  return (
    <div className="project-case-page min-h-screen bg-[#D8D7D3] text-[#050505]">
      <Navigation activeItem="projects" />

      <main className="project-case">
        <aside className="project-case__sidebar">
          <div>
            <h1>{project.title.toLowerCase()}</h1>
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
          {orderedMedia.map((block, index) => (
            <MediaBlock block={block} key={`${block.type}-${index}`} />
          ))}
        </section>
      </main>
    </div>
  );
}
