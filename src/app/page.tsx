"use client";

import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChiffonGrid from "@/components/ChiffonGrid";
import { site } from "@/lib/site";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader variant="transparent" />

      <section className="hero-glow relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          }}
        />

        <div className="relative z-10 animate-fade-up">
          <Image
            src="/logo.png"
            alt={site.name}
            width={420}
            height={420}
            priority
            className="mx-auto h-auto w-[min(78vw,360px)] object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.25)]"
          />
        </div>

        <p className="relative z-10 mt-6 max-w-md animate-fade-up-delay text-sm leading-relaxed text-muted sm:text-base">
          {t("heroLine")}
        </p>

        <div className="relative z-10 mt-8 animate-fade-up-delay-2">
          <a
            href="#collection"
            className="btn-gold inline-flex px-8 py-3 text-sm tracking-[0.18em] uppercase"
          >
            {t("browseCollection")}
          </a>
        </div>
      </section>

      <section id="collection" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 max-w-xl">
            <p className="text-xs tracking-[0.35em] text-primary uppercase">
              {t("collection")}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t("findYourChiffon")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {t("collectionIntro")}
            </p>
          </div>
          <ChiffonGrid />
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-20 bg-[linear-gradient(180deg,#050505_0%,#0d0b08_50%,#050505_100%)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs tracking-[0.35em] text-primary uppercase">
            {t("about")}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-wide text-foreground sm:text-5xl">
            {t("aboutTitle")}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            {t("aboutBody")}
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
