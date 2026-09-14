import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      if (e.key === 'Tab') {
        const container = containerRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);

    // Move focus into the dialog
    const container = containerRef.current;
    const focusable = container
      ? (Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          )).filter((el) => !el.hasAttribute('disabled')) as HTMLElement[])
      : [];
    (focusable[0] ?? container)?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      // restore focus
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div
          ref={containerRef}
          tabIndex={-1}
          className="rounded-md bg-black p-2"
        >
          <div className="flex justify-end p-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-chalk hover:bg-white/20"
              aria-label="Close dialog"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
