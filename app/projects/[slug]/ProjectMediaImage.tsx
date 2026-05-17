'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

type ProjectMediaImageProps = {
  src: string;
  alt: string;
  caption?: string;
  showCaption?: boolean;
};

const imageZoomEnabled = false;

export function ProjectMediaImage({ src, alt, caption, showCaption = true }: ProjectMediaImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ pointerId: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragStart(null);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function updateZoom(nextZoom: number) {
    const clampedZoom = Math.min(4, Math.max(1, Number(nextZoom.toFixed(2))));
    setZoom(clampedZoom);
    if (clampedZoom <= 1) {
      setPan({ x: 0, y: 0 });
      setDragStart(null);
    }
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragStart(null);
  }

  const lightbox = imageZoomEnabled && isOpen ? (
    <div
      className="project-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={caption ? titleId : undefined}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
      onWheel={(event) => {
        event.preventDefault();
        updateZoom(zoom + (event.deltaY < 0 ? 0.18 : -0.18));
      }}
    >
      <div className="project-lightbox__toolbar" aria-label="Image viewer controls">
        <button type="button" onClick={() => updateZoom(zoom - 0.35)} disabled={zoom <= 1}>
          Zoom out
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => updateZoom(zoom + 0.35)} disabled={zoom >= 4}>
          Zoom in
        </button>
        <button type="button" onClick={resetView}>
          Reset
        </button>
        <button type="button" onClick={() => setIsOpen(false)} aria-label="Close image viewer">
          Close
        </button>
      </div>
      <figure
        className="project-lightbox__figure"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div
          className="project-lightbox__stage"
          data-zoomed={zoom > 1}
          data-dragging={Boolean(dragStart)}
          onPointerDown={(event) => {
            if (zoom <= 1) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragStart({
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              panX: pan.x,
              panY: pan.y,
            });
          }}
          onPointerMove={(event) => {
            if (!dragStart || dragStart.pointerId !== event.pointerId) return;
            setPan({
              x: dragStart.panX + event.clientX - dragStart.x,
              y: dragStart.panY + event.clientY - dragStart.y,
            });
          }}
          onPointerUp={(event) => {
            if (dragStart?.pointerId === event.pointerId) setDragStart(null);
          }}
          onPointerCancel={(event) => {
            if (dragStart?.pointerId === event.pointerId) setDragStart(null);
          }}
        >
          <img
            className="project-lightbox__image"
            src={src}
            alt={alt}
            draggable={false}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          />
        </div>
        {caption ? <figcaption id={titleId}>{caption}</figcaption> : null}
      </figure>
    </div>
  ) : null;

  return (
    <>
      <button
        className="project-case__image-button"
        data-zoom-enabled={imageZoomEnabled}
        type="button"
        onClick={() => {
          if (imageZoomEnabled) setIsOpen(true);
        }}
        aria-disabled={!imageZoomEnabled}
        aria-label={`Open image: ${alt}`}
      >
        <img className="project-case__media-img" src={src} alt={alt} draggable={false} />
      </button>
      {showCaption && caption ? <figcaption>{caption}</figcaption> : null}
      {isMounted && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
