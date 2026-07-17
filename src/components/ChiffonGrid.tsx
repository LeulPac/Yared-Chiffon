"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChiffonCard from "./ChiffonCard";
import type { PublicChiffon } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { localizedText } from "@/lib/i18n";

type ChiffonGridProps = {
  initialChiffons?: PublicChiffon[];
};

/** Initial visible card counts (2 rows × columns) */
const INITIAL_MOBILE = 2 * 2;   // 4
const INITIAL_DESKTOP = 2 * 3;  // 6
const STEP_MOBILE = 2 * 2;   // load 2 more rows on mobile
const STEP_DESKTOP = 2 * 3;  // load 2 more rows on desktop

export default function ChiffonGrid({
  initialChiffons = [],
}: ChiffonGridProps) {
  const { t, locale } = useLanguage();
  const [chiffons, setChiffons] = useState<PublicChiffon[]>(initialChiffons);
  const [loading, setLoading] = useState(initialChiffons.length === 0);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_DESKTOP);
  const [isMobile, setIsMobile] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Track mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setVisibleCount(mobile ? INITIAL_MOBILE : INITIAL_DESKTOP);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  async function fetchChiffons(bust = false) {
    try {
      const url = bust ? `/api/chiffons?t=${Date.now()}` : "/api/chiffons";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setChiffons(data);
    } catch {
      // ignore errors, keep existing data
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialChiffons.length) {
      fetchChiffons();
    } else {
      setLoading(false);
    }

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("chiffon-updates");
      channel.onmessage = (event) => {
        const type = event.data?.type;
        if (
          type === "chiffon-posted" ||
          type === "chiffon-deleted" ||
          type === "submission-created"
        ) {
          fetchChiffons(true); // bust cache on broadcast
        }
      };
      channelRef.current = channel;

      return () => {
        channel.close();
      };
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(fetchChiffons, 45000);
    return () => window.clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chiffons;

    return chiffons.filter((c) => {
      const title = localizedText(c.title, c.titleAm, locale).toLowerCase();
      const description = localizedText(
        c.description,
        c.descriptionAm,
        locale,
      ).toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [chiffons, search, locale]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const step = isMobile ? STEP_MOBILE : STEP_DESKTOP;

  return (
    <div>
      <div className="mb-8">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input-dark sm:max-w-md"
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : !chiffons.length ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
          {t("emptyCollection")}
        </div>
      ) : !filtered.length ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
          {t("noSearchResults")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {visible.map((chiffon) => (
              <ChiffonCard key={chiffon.id} chiffon={chiffon} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <button
                onClick={() => setVisibleCount((n) => n + step)}
                className="group relative overflow-hidden rounded-xl border border-primary/30 px-8 py-3 text-sm tracking-[0.18em] text-primary uppercase transition hover:border-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.18)]"
              >
                <span
                  className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-primary/8 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"
                />
                {locale === "am" ? "ብዙ ይመልከቱ" : "See More"}
              </button>
              <p className="text-xs text-muted/60">
                {filtered.length - visibleCount}{" "}
                {locale === "am" ? "ተጨማሪ" : "more"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
