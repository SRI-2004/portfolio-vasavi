'use client';

import { useEffect } from 'react';

function isProtectedImageTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('img, [data-protected-image]'));
}

export function ImageProtection() {
  useEffect(() => {
    function preventImageContextMenu(event: MouseEvent) {
      if (isProtectedImageTarget(event.target)) event.preventDefault();
    }

    document.addEventListener('contextmenu', preventImageContextMenu);

    return () => {
      document.removeEventListener('contextmenu', preventImageContextMenu);
    };
  }, []);

  return null;
}
