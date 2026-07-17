"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="inline-flex items-center overflow-hidden border border-border"
      role="group"
      aria-label={t("language")}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase transition ${
          locale === "en"
            ? "bg-primary text-black"
            : "text-muted hover:text-primary"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("am")}
        className={`px-2.5 py-1.5 text-[10px] tracking-[0.12em] transition ${
          locale === "am"
            ? "bg-primary text-black"
            : "text-muted hover:text-primary"
        }`}
      >
        አማ
      </button>
    </div>
  );
}
