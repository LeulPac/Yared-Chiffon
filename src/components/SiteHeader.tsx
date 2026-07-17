"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

type SiteHeaderProps = {
  variant?: "transparent" | "solid";
};

export default function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: "/#collection", label: t("collection") },
    { href: "/#about", label: t("about") },
    { href: "/#contact", label: t("contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isGlassy = variant === "transparent" ? scrolled : true;

  const barClass = variant === "transparent"
    ? scrolled
      ? "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-in-out border-b border-primary/20 bg-black/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
      : "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-in-out bg-gradient-to-b from-black/70 to-transparent"
    : "sticky top-0 z-40 border-b border-primary/20 bg-black/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]";

  return (
    <>
      <header className={barClass}>
        {/* Top gold accent line */}
        <div
          className={`h-[2px] w-full transition-opacity duration-500 ${isGlassy ? "opacity-100" : "opacity-0"}`}
          style={{
            background:
              "linear-gradient(90deg, transparent, #d4af37 25%, #f0d78c 50%, #d4af37 75%, transparent)",
          }}
        />

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-500 ${isGlassy ? "opacity-60" : "opacity-20"}`}
                style={{ background: "radial-gradient(circle, rgba(212,175,55,0.5), transparent 70%)" }}
              />
              <Image
                src="/logo.png"
                alt={site.name}
                width={52}
                height={52}
                className="relative h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p
                className="font-display text-lg leading-none tracking-[0.22em]"
                style={{
                  background: "linear-gradient(120deg, #8a7020, #f0d78c, #d4af37, #f7e7a8, #a8892e)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  animation: "soft-shine 5s linear infinite alternate",
                }}
              >
                YARED
              </p>
              <p className="mt-0.5 text-[9px] tracking-[0.42em] text-primary/60 uppercase">
                CHIFFON
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group/link relative text-xs tracking-[0.22em] text-muted/80 uppercase transition-colors duration-300 hover:text-primary"
                >
                  {link.label}
                  {/* Animated underline */}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover/link:w-full"
                    style={{ boxShadow: "0 0 6px rgba(212,175,55,0.7)" }}
                  />
                </a>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-4 w-px bg-primary/25" />

            <LanguageSwitcher />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-black/60 text-primary transition hover:border-primary hover:bg-primary/10"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={`absolute transition-all duration-300 text-xl ${open ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
              >
                ×
              </span>
              <span
                className={`absolute transition-all duration-300 text-base ${open ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}
              >
                ☰
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav
            className="border-t px-4 py-5"
            style={{ borderColor: "rgba(212,175,55,0.15)", background: "rgba(5,5,5,0.97)" }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, idx) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm tracking-[0.2em] text-muted uppercase transition hover:bg-primary/5 hover:text-primary"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span
                    className="h-px w-4 bg-primary/40 transition-all"
                    style={{ boxShadow: "0 0 4px rgba(212,175,55,0.5)" }}
                  />
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
