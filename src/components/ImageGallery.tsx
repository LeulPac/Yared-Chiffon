"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ImageGalleryProps = {
  images: string[];
  title: string;
  large?: boolean;
  showThumbnails?: boolean;
};

export default function ImageGallery({
  images,
  title,
  large = false,
  showThumbnails = false,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images.length) {
    return (
      <div
        className={`flex items-center justify-center bg-border/40 text-muted ${
          large ? "h-80 rounded-2xl" : "h-56 rounded-t-2xl"
        }`}
      >
        No image
      </div>
    );
  }

  const heightClass = large ? "h-80" : "h-56";
  const roundedClass = large ? "rounded-2xl" : "rounded-t-2xl";

  function goPrev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function lightboxPrev() {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function lightboxNext() {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <div>
        <div className="relative">
          <div
            className={`relative ${heightClass} overflow-hidden ${roundedClass} bg-border/20 cursor-zoom-in`}
            onClick={() => openLightbox(activeIndex)}
          >
            <Image
              src={images[activeIndex]}
              alt={`${title} - image ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes={large ? "800px" : "(max-width: 768px) 100vw, 400px"}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white text-lg transition hover:bg-black/80 hover:scale-110"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white text-lg transition hover:bg-black/80 hover:scale-110"
                aria-label="Next image"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`h-2 w-2 rounded-full transition ${
                      i === activeIndex ? "bg-primary scale-125" : "bg-primary/40"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {showThumbnails && images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setActiveIndex(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === activeIndex ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={url}
                  alt={`${title} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen Lightbox with prev/next */}
      {lightboxOpen && (
        <LightboxOverlay
          images={images}
          title={title}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
          onGoTo={setLightboxIndex}
        />
      )}
    </>
  );
}

type LightboxOverlayProps = {
  images: string[];
  title: string;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
};

function LightboxOverlay({
  images,
  title,
  index,
  onClose,
  onPrev,
  onNext,
  onGoTo,
}: LightboxOverlayProps) {
  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/97 animate-fade-in">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white hover:bg-white/20 transition"
        aria-label="Close lightbox"
      >
        ×
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 text-xs text-white/60 tracking-widest">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative h-[80vh] w-[90vw] pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${title} ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Prev / Next arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-black/70 text-primary text-2xl transition hover:bg-black hover:border-primary hover:scale-110"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-black/70 text-primary text-2xl transition hover:bg-black hover:border-primary hover:scale-110"
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      {/* Thumbnail strip at the bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => onGoTo(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index
                  ? "border-primary scale-110 shadow-[0_0_12px_rgba(212,175,55,0.5)]"
                  : "border-white/15 opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={url}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click backdrop to close */}
      <div
        className="absolute inset-0 z-[-1]"
        onClick={onClose}
      />
    </div>
  );
}
