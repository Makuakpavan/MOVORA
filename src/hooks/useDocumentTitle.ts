import { useEffect } from 'react';

/** Keeps the browser tab label in step with the current page. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} — MOVORA` : 'MOVORA';
  }, [title]);
}
