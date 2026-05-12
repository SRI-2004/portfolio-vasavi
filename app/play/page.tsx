import type { Metadata } from 'next';
import { Navigation } from '@/app/components/Navigation';
import { ProjectMediaBlocks } from '@/app/components/ProjectMediaBlocks';
import { PublicFooter } from '@/app/components/PublicFooter';
import { getPlayPage } from '@/app/data/projectQueries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Play | Vasavi Sridhar',
  description: 'Play experiments and visual notes by Vasavi Sridhar.',
};

export default async function PlayPage() {
  const playPage = await getPlayPage();
  const media = playPage?.detail.media ?? [];

  return (
    <div className="play-page public-page-shell bg-white text-[#191919]">
      <Navigation activeItem="play" />

      <main className="play-page__main public-page-main">
        <header className="play-page__header">
          <p>Play</p>
          <h1>{playPage?.detail.headline || playPage?.title || 'Play'}</h1>
          {playPage?.detail.summary?.length ? (
            <div>
              {playPage.detail.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </header>

        {media.length ? (
          <section className="play-page__media" aria-label="Play media">
            <ProjectMediaBlocks blocks={media} />
          </section>
        ) : (
          <p className="play-page__empty">No play content has been published yet.</p>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
