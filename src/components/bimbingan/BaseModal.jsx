'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BaseModal({ isOpen, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[620px] rounded-[10px] border border-[#d1d5dc] bg-white px-6 py-5 shadow-xl"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <button
          type="button"
          aria-label="Tutup modal"
          onClick={() => onClose?.()}
          className="absolute right-4 top-4 rounded-full p-1 text-[#717182] transition hover:bg-[#f3f3f5] hover:text-[#0f172a]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-8">
          <h2 className="text-lg font-bold text-[#015023]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#717182]">{subtitle}</p> : null}
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
