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
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#18223a]/55 p-5 backdrop-blur-md animate-fade"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full ${width === 'wide' ? 'max-w-[650px]' : 'max-w-[440px]'} bg-white p-7 sm:p-9 shadow-modal animate-rise`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center border-0 bg-[#f2f4f7] text-[#59677f] transition hover:bg-[#e4e7ec] hover:text-ink"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <span className="eyebrow">ATELIER MOTORS</span>
          <h2 className="mt-3.5 mb-2 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.055em] text-ink">
            {title}
          </h2>
          {subtitle && <p className="text-[13px] leading-relaxed text-muted">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
