'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProjectImage } from '@/app/data/projects';
import { ProjectMediaImage } from '@/app/projects/[slug]/ProjectMediaImage';

export function ProjectScrapbook({ pages, caption }: { pages: ProjectImage[]; caption?: string }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isSinglePage, setIsSinglePage] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMode = () => setIsSinglePage(media.matches);

    updateMode();
    media.addEventListener('change', updateMode);
    return () => media.removeEventListener('change', updateMode);
  }, []);

  const step = isSinglePage ? 1 : 2;
  const maxIndex = Math.max(0, pages.length - step);
  const visiblePages = useMemo(() => pages.slice(pageIndex, pageIndex + step), [pageIndex, pages, step]);

  useEffect(() => {
    setPageIndex((currentIndex) => Math.min(currentIndex, maxIndex));
  }, [maxIndex]);

  function goNext() {
    setPageIndex((currentIndex) => Math.min(maxIndex, currentIndex + step));
  }

  function goPrevious() {
    setPageIndex((currentIndex) => Math.max(0, currentIndex - step));
  }

  return (
    <figure
      className="project-scrapbook"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') goNext();
        if (event.key === 'ArrowLeft') goPrevious();
      }}
    >
      <div className="project-scrapbook__spread" data-single={isSinglePage}>
        {visiblePages.map((page, index) => (
          <div className="project-scrapbook__page" key={`${page.src}-${pageIndex + index}`}>
            <ProjectMediaImage src={page.src} alt={page.alt} caption={page.caption || caption} showCaption={false} />
          </div>
        ))}
        {!isSinglePage && visiblePages.length === 1 ? (
          <div className="project-scrapbook__page project-scrapbook__page--blank" aria-hidden="true" />
        ) : null}
      </div>

      <div className="project-scrapbook__controls">
        <button type="button" onClick={goPrevious} disabled={pageIndex === 0}>
          Previous
        </button>
        <span>
          {pageIndex + 1}-{Math.min(pageIndex + step, pages.length)} / {pages.length}
        </span>
        <button type="button" onClick={goNext} disabled={pageIndex >= maxIndex}>
          Next
        </button>
      </div>

      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
