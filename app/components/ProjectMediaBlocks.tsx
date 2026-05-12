import { ProjectMediaImage } from '@/app/projects/[slug]/ProjectMediaImage';
import { ProjectScrapbook } from '@/app/projects/[slug]/ProjectScrapbook';
import {
  type ProjectImage,
  type ProjectMediaBlock,
  type ProjectVideo,
} from '@/app/data/projects';

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
        <img className="project-case__media-img" src={video.poster} alt={video.title || 'Video poster'} />
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
      title={video.title || 'Video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function ImageBlock({ image }: { image: ProjectImage }) {
  return (
    <figure className="project-case__figure" data-aspect={image.aspect || 'wide'}>
      <ProjectMediaImage src={image.src} alt={image.alt} caption={image.caption} />
    </figure>
  );
}

function GalleryBlock({ block }: { block: Extract<ProjectMediaBlock, { type: 'gallery' }> }) {
  if (!block.items.length && !block.pdf?.src) return null;

  if (block.layout === 'collage') {
    return (
      <section className="project-case__gallery" data-layout="collage">
        {block.title ? <h2>{block.title}</h2> : null}
        <figure className="project-case__collage-figure">
          <div className="project-case__collage-grid" data-count={Math.min(block.items.length, 5)}>
            {block.items.map((item, index) => (
              <div className="project-case__collage-cell" key={`${item.src}-${index}`}>
                <ProjectMediaImage
                  src={item.src}
                  alt={item.alt}
                  caption={block.caption || item.caption}
                  showCaption={false}
                />
              </div>
            ))}
          </div>
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      </section>
    );
  }

  if (block.layout === 'scrapbook') {
    return (
      <section className="project-case__gallery" data-layout="scrapbook">
        {block.title ? <h2>{block.title}</h2> : null}
        <ProjectScrapbook pages={block.items} caption={block.caption} pdf={block.pdf} />
      </section>
    );
  }

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

export function ProjectMediaBlocks({
  blocks,
  prioritizeVideos = false,
}: {
  blocks: ProjectMediaBlock[];
  prioritizeVideos?: boolean;
}) {
  const orderedBlocks = prioritizeVideos
    ? [...blocks.filter((block) => block.type === 'video'), ...blocks.filter((block) => block.type !== 'video')]
    : blocks;

  return (
    <>
      {orderedBlocks.map((block, index) => (
        <MediaBlock block={block} key={`${block.type}-${index}`} />
      ))}
    </>
  );
}
