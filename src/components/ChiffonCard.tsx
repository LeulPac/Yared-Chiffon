"use client";

import { useState } from "react";
import Image from "next/image";
import ChiffonDetailModal from "./ChiffonDetailModal";
import type { PublicChiffon } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { localizedText } from "@/lib/i18n";

type ChiffonCardProps = {
  chiffon: PublicChiffon;
};

export default function ChiffonCard({ chiffon }: ChiffonCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { t, locale } = useLanguage();
  const title = localizedText(chiffon.title, chiffon.titleAm, locale);
  const description = localizedText(
    chiffon.description,
    chiffon.descriptionAm,
    locale,
  );

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(212,175,55,0.12)]">
        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className="w-full cursor-pointer text-left"
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
          </div>

          <div className="p-5">
            <h2 className="font-display text-xl tracking-wide text-foreground">
              {title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {description}
            </p>
            <p className="mt-4 text-xs font-medium tracking-[0.2em] text-primary uppercase">
              {t("viewDetails")}
            </p>
          </div>
        </button>
      </article>

      {showDetail && (
        <ChiffonDetailModal
          chiffon={chiffon}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
