'use client';
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeImageLightbox, setLightboxIndex } from '@/store/slices/uiSlice';

export default function ImageLightbox() {
  const dispatch = useAppDispatch();
  const { open, images, index } = useAppSelector(s => s.ui.imageLightbox);

  const close = useCallback(() => dispatch(closeImageLightbox()), [dispatch]);
  const prev = useCallback(() => dispatch(setLightboxIndex((index - 1 + images.length) % images.length)), [dispatch, index, images.length]);
  const next = useCallback(() => dispatch(setLightboxIndex((index + 1) % images.length)), [dispatch, index, images.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, prev, next]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" onClick={close}>
      <button onClick={close} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <span className="absolute top-4 left-4 text-white/80 text-sm font-medium">
          {index + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-2 md:left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-2 md:right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
