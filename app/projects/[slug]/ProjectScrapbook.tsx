'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProjectImage, ProjectPdf } from '@/app/data/projects';
import { ProjectMediaImage } from '@/app/projects/[slug]/ProjectMediaImage';

export function ProjectScrapbook({ pages, caption, pdf }: { pages: ProjectImage[]; caption?: string; pdf?: ProjectPdf }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [pdfPages, setPdfPages] = useState<ProjectImage[]>([]);
  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [pdfMessage, setPdfMessage] = useState('');
  const [turnDirection, setTurnDirection] = useState<'next' | 'previous'>('next');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMode = () => setIsSinglePage(media.matches);

    updateMode();
    media.addEventListener('change', updateMode);
    return () => media.removeEventListener('change', updateMode);
  }, []);

  useEffect(() => {
    if (!pdf?.src) {
      setPdfPages([]);
      setPdfState('idle');
      setPdfMessage('');
      return;
    }

    let isCancelled = false;
    const pdfSource = pdf.src;
    const pdfName = pdf.name;

    async function renderPdfPages() {
      setPdfState('loading');
      setPdfMessage('');

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

        const loadingTask = pdfjs.getDocument(pdfSource);
        const pdfDocument = await loadingTask.promise;
        const renderedPages: ProjectImage[] = [];

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          if (isCancelled) return;

          const page = await pdfDocument.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) throw new Error('Could not create a canvas for PDF rendering.');

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;

          renderedPages.push({
            src: canvas.toDataURL('image/png'),
            alt: `${pdfName || 'Scrapbook'} page ${pageNumber}`,
          });
        }

        if (!isCancelled) {
          setPdfPages(renderedPages);
          setPageIndex(0);
          setPdfState('ready');
        }
      } catch {
        if (!isCancelled) {
          setPdfPages([]);
          setPdfState('error');
          setPdfMessage('The PDF could not be loaded. Showing uploaded page images instead.');
        }
      }
    }

    renderPdfPages();

    return () => {
      isCancelled = true;
    };
  }, [pdf?.src, pdf?.name]);

  const scrapbookPages = pdfPages.length ? pdfPages : pages;
  const step = isSinglePage ? 1 : 2;
  const maxIndex = Math.max(0, scrapbookPages.length - step);
  const visiblePages = useMemo(
    () => scrapbookPages.slice(pageIndex, pageIndex + step),
    [pageIndex, scrapbookPages, step],
  );

  useEffect(() => {
    setPageIndex((currentIndex) => Math.min(currentIndex, maxIndex));
  }, [maxIndex]);

  function goNext() {
    setPageIndex((currentIndex) => {
      const nextIndex = Math.min(maxIndex, currentIndex + step);
      if (nextIndex !== currentIndex) setTurnDirection('next');
      return nextIndex;
    });
  }

  function goPrevious() {
    setPageIndex((currentIndex) => {
      const nextIndex = Math.max(0, currentIndex - step);
      if (nextIndex !== currentIndex) setTurnDirection('previous');
      return nextIndex;
    });
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
      {pdfState === 'loading' ? <p className="project-scrapbook__status">Rendering PDF pages...</p> : null}
      {pdfState === 'error' && pdfMessage ? <p className="project-scrapbook__status">{pdfMessage}</p> : null}

      <div className="project-scrapbook__spread" data-single={isSinglePage} data-turn={turnDirection} key={`${pageIndex}-${step}`}>
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
          {scrapbookPages.length
            ? `${pageIndex + 1}-${Math.min(pageIndex + step, scrapbookPages.length)} / ${scrapbookPages.length}`
            : '0 / 0'}
        </span>
        <button type="button" onClick={goNext} disabled={pageIndex >= maxIndex}>
          Next
        </button>
      </div>

      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
