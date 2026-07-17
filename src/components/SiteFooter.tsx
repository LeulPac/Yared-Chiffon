"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { toTelHref } from "@/lib/phone";
import { useLanguage } from "./LanguageProvider";

export default function SiteFooter() {
  const { t } = useLanguage();

  const footerLinks = [
    { href: "/#collection", label: t("collection") },
    { href: "/#about", label: t("about") },
    { href: "/#contact", label: t("contact") },
  ];

  return (
    <footer className="border-t border-border bg-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={site.name}
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
            <div>
              <p className="font-display text-xl tracking-[0.18em] text-primary">
                YARED
              </p>
              <p className="text-[10px] tracking-[0.35em] text-primary-light/80">
                CHIFFON
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {t("footerBlurb")}
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg tracking-wide text-primary">
            {t("explore")}
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div id="contact">
          <h3 className="font-display text-lg tracking-wide text-primary">
            {t("reachOut")}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>
              <span className="block text-xs tracking-[0.2em] text-primary/70 uppercase">
                {t("phone")}
              </span>
              <a
                href={toTelHref(site.phone)}
                className="mt-1 inline-block text-foreground transition hover:text-primary"
              >
                {site.phone}
              </a>
            </p>
            <p>
              <span className="block text-xs tracking-[0.2em] text-primary/70 uppercase">
                {t("email")}
              </span>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 inline-block text-foreground transition hover:text-primary"
              >
                {site.email}
              </a>
            </p>
            <p>
              <span className="block text-xs tracking-[0.2em] text-primary/70 uppercase">
                {t("location")}
              </span>
              <span className="mt-1 inline-block text-foreground">
                {site.address}
              </span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.18em] text-muted uppercase transition hover:text-primary"
            >
              Instagram
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.18em] text-muted uppercase transition hover:text-primary"
            >
              Facebook
            </a>
            <a
              href={site.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.18em] text-muted uppercase transition hover:text-primary"
            >
              TikTok
            </a>
            <a
              href={site.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.18em] text-muted uppercase transition hover:text-primary"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. {t("rightsReserved")}
          </p>
          <p className="tracking-[0.25em] text-primary/70 uppercase">
            {t("tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
