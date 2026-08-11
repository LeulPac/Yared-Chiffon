"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ChiffonDetailModal from "./ChiffonDetailModal";
import type { PublicChiffon } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { localizedText } from "@/lib/i18n";

type ChiffonCardProps = {
  chiffon: PublicChiffon;
};

function submittedKey(id: string) {
  return `submitted_${id}`;
}

export default function ChiffonCard({ chiffon }: ChiffonCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { locale } = useLanguage();
  const title = localizedText(chiffon.title, chiffon.titleAm, locale);

  // On mount, check if this chiffon was already submitted
  useEffect(() => {
    try {
      setSubmitted(localStorage.getItem(submittedKey(chiffon.id)) === "1");
    } catch {
      // ignore
    }
  }, [chiffon.id]);

  function handleCardClick() {
    // If already submitted, clicking again closes/hides the form — toggle off
    if (showDetail) {
      setShowDetail(false);
    } else {
      setShowDetail(true);
    }
  }

  function handleSubmitted() {
    try {
      localStorage.setItem(submittedKey(chiffon.id), "1");
    } catch {
      // ignore
    }
    setSubmitted(true);
    setShowDetail(false);
  }

  return (
    <>
      <article
        className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(212,175,55,0.12)] cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative h-56 overflow-hidden bg-black">
          {chiffon.images[0] ? (
            <Image
              src={chiffon.images[0]}
              alt={title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              No image
            </div>
          )}
          {chiffon.images.length > 1 && (
            <span className="absolute bottom-3 right-3 border border-primary/40 bg-black/70 px-2 py-1 text-xs text-primary">
              {chiffon.images.length} photos
            </span>
          )}
          {submitted && (
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-primary/50 bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-primary">
              ✓ {locale === "am" ? "ቀደም ብለው አስገብተዋል" : "Submitted"}
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="font-display text-lg tracking-wide text-foreground line-clamp-1">
            {title}
          </h2>
          <p className="mt-3 text-xs font-medium tracking-[0.2em] text-primary uppercase">
            {submitted
              ? locale === "am" ? "አስቀድሞ ቀርቧል ✓" : "Already submitted ✓"
              : locale === "am" ? "ጠቅ ያድርጉ →" : "Tap to submit →"}
          </p>
        </div>
      </article>

      {showDetail && (
        <ChiffonDetailModal
          chiffon={chiffon}
          onClose={() => setShowDetail(false)}
          submitted={submitted}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}
