import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal dialog with backdrop blur, keyboard ESC dismissal,
 * and focus preservation.
 */
export function Modal({ title, subtitle, onClose, children, width = 'normal' }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#18223a]/55 p-3 sm:p-5 backdrop-blur-md animate-fade"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent="true"
    >
      <div
        className={`relative w-full ${width === 'wide' ? 'max-w-[700px]' : 'max-w-[460px]'} max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-white shadow-modal animate-rise rounded-sm overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-lenis-prevent="true"
      >
        <div className="shrink-0 relative border-b border-[#edf1f7] bg-white px-6 pt-6 pb-4 sm:px-8 sm:pt-7 sm:pb-5">
          <button
            type="button"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-sm border-0 bg-[#f2f4f7] text-[#59677f] transition hover:bg-[#e4e7ec] hover:text-ink cursor-pointer"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          <span className="eyebrow">ATELIER MOTORS</span>
          <h2 className="mt-2 mb-1 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.055em] text-ink pr-10">
            {title}
          </h2>
          {subtitle && <p className="text-[13px] leading-relaxed text-muted pr-10">{subtitle}</p>}
        </div>

        <div
          data-lenis-prevent="true"
          className="modal-scroll-body flex-1 overflow-y-auto p-6 sm:p-8 overscroll-contain"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
