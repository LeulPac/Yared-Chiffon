"use client";

import { useEffect } from "react";
import ImageGallery from "./ImageGallery";
import SubmissionForm from "./SubmissionForm";
import type { PublicChiffon } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { localizedText } from "@/lib/i18n";

type ChiffonDetailModalProps = {
  chiffon: PublicChiffon;
  onClose: () => void;
  /** true when this chiffon has already been submitted */
  submitted: boolean;
  onSubmitted: () => void;
};

export default function ChiffonDetailModal({
  chiffon,
  onClose,
  submitted,
  onSubmitted,
}: ChiffonDetailModalProps) {
  const { locale } = useLanguage();
  const title = localizedText(chiffon.title, chiffon.titleAm, locale);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="surface-glow relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-primary/30 bg-card shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-black/70 text-primary transition hover:bg-black"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-5">
          {/* Gallery */}
          <ImageGallery
            images={chiffon.images}
            title={title}
            large
            showThumbnails
          />

          {/* Title */}
          <h2 className="mt-4 font-display text-2xl tracking-wide text-foreground">
            {title}
          </h2>

          {/* Divider */}
          <div className="my-4 h-px bg-border/60" />

          {/* Submission area */}
          {submitted ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-5 text-center">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-sm font-semibold text-primary">
                {locale === "am" ? "ቀደም ብለው አስገብተዋል" : "Already submitted"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {locale === "am"
                  ? "ለዚህ ካርድ አስገብተዋል፤ ሌላ ጊዜ ማስገባት አይቻልም።"
                  : "You have already submitted for this card."}
              </p>
            </div>
          ) : (
            <SubmissionForm
              chiffonId={chiffon.id}
              onSuccess={onSubmitted}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
