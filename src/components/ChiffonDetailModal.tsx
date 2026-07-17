"use client";

import { useEffect, useState } from "react";
import ImageGallery from "./ImageGallery";
import SubmissionForm from "./SubmissionForm";
import type { PublicChiffon } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { localizedText } from "@/lib/i18n";

type ChiffonDetailModalProps = {
  chiffon: PublicChiffon;
  onClose: () => void;
};

export default function ChiffonDetailModal({
  chiffon,
  onClose,
}: ChiffonDetailModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t, locale } = useLanguage();
  const title = localizedText(chiffon.title, chiffon.titleAm, locale);
  const description = localizedText(
    chiffon.description,
    chiffon.descriptionAm,
    locale,
  );

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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="surface-glow relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-black/70 text-primary transition hover:bg-black"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-5">
          <ImageGallery
            images={chiffon.images}
            title={title}
            large
            showThumbnails
          />

          <h2 className="mt-5 font-display text-2xl tracking-wide text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>

          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold mt-5 w-full px-4 py-3 text-sm"
            >
              {t("doYouHave")}
            </button>
          )}

          {submitted && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm text-primary-light">
              {t("thankYou")}
            </div>
          )}

          {showForm && !submitted && (
            <SubmissionForm
              chiffonId={chiffon.id}
              onSuccess={() => {
                setShowForm(false);
                setSubmitted(true);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
