"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { AdminChiffon, AdminSubmission } from "@/lib/types";
import { toTelHref } from "@/lib/phone";
import AdminHeader from "./AdminHeader";

type OwnerGroup = {
  key: string;
  ownerName: string;
  ownerPhone: string;
  chiffons: AdminChiffon[];
  totalSubmissions: number;
};

type GroupedSubmission = {
  key: string;
  floor: string;
  roomNumber: string;
  createdAt: string;
  items: { id: string; packageType: string; value: string }[];
};

// Sort items in each group: METER first, then TAQA, then SIRY
const PACKAGE_ORDER: Record<string, number> = { METER: 0, TAQA: 1, SIRY: 2 };

// Short label & color per package type
const PKG_META: Record<string, { short: string; dot: string }> = {
  METER: { short: "M", dot: "bg-sky-400" },
  TAQA: { short: "T", dot: "bg-amber-400" },
  SIRY: { short: "S", dot: "bg-rose-400" },
};

function pkgLabel(type: string) {
  return PKG_META[type]?.short ?? type.charAt(0);
}
function pkgDot(type: string) {
  return PKG_META[type]?.dot ?? "bg-primary";
}

function sortItems(items: { id: string; packageType: string; value: string }[]) {
  return [...items].sort(
    (a, b) =>
      (PACKAGE_ORDER[a.packageType] ?? 99) - (PACKAGE_ORDER[b.packageType] ?? 99)
  );
}

function groupSubmissions(submissions: AdminSubmission[]): GroupedSubmission[] {
  const map = new Map<string, GroupedSubmission>();

  for (const s of submissions) {
    const dateObj = new Date(s.createdAt);
    const timeKey = Math.floor(dateObj.getTime() / 10000);
    const key = `${(s.floor || "").trim().toLowerCase()}_${(s.roomNumber || "").trim().toLowerCase()}_${timeKey}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        floor: s.floor,
        roomNumber: s.roomNumber,
        createdAt: s.createdAt,
        items: [],
      });
    }

    const group = map.get(key)!;
    group.items.push({
      id: s.id,
      packageType: s.packageType,
      value: s.value,
    });
  }

  // Sort items within each group
  const result = Array.from(map.values());
  result.forEach((g) => {
    g.items = sortItems(g.items);
  });
  return result;
}

const SUPER_CARD_THEMES = [
  {
    name: "Gold",
    border: "border-amber-500/70 hover:border-amber-400 shadow-[0_10px_35px_rgba(245,158,11,0.2)]",
    bg: "bg-gradient-to-br from-amber-950 via-amber-900/60 to-black text-amber-100",
    avatar: "border-amber-400 bg-amber-500/30 text-amber-300 group-hover/header:bg-amber-500/50",
    badge: "border-amber-400/60 bg-amber-500/30 text-amber-200",
    subText: "text-amber-300 font-semibold",
  },
  {
    name: "Emerald",
    border: "border-emerald-500/70 hover:border-emerald-400 shadow-[0_10px_35px_rgba(16,185,129,0.2)]",
    bg: "bg-gradient-to-br from-emerald-950 via-emerald-900/60 to-black text-emerald-100",
    avatar: "border-emerald-400 bg-emerald-500/30 text-emerald-300 group-hover/header:bg-emerald-500/50",
    badge: "border-emerald-400/60 bg-emerald-500/30 text-emerald-200",
    subText: "text-emerald-300 font-semibold",
  },
  {
    name: "Cyan",
    border: "border-cyan-500/70 hover:border-cyan-400 shadow-[0_10px_35px_rgba(6,182,212,0.2)]",
    bg: "bg-gradient-to-br from-cyan-950 via-cyan-900/60 to-black text-cyan-100",
    avatar: "border-cyan-400 bg-cyan-500/30 text-cyan-300 group-hover/header:bg-cyan-500/50",
    badge: "border-cyan-400/60 bg-cyan-500/30 text-cyan-200",
    subText: "text-cyan-300 font-semibold",
  },
  {
    name: "Purple",
    border: "border-purple-500/70 hover:border-purple-400 shadow-[0_10px_35px_rgba(168,85,247,0.2)]",
    bg: "bg-gradient-to-br from-purple-950 via-purple-900/60 to-black text-purple-100",
    avatar: "border-purple-400 bg-purple-500/30 text-purple-300 group-hover/header:bg-purple-500/50",
    badge: "border-purple-400/60 bg-purple-500/30 text-purple-200",
    subText: "text-purple-300 font-semibold",
  },
  {
    name: "Rose",
    border: "border-rose-500/70 hover:border-rose-400 shadow-[0_10px_35px_rgba(244,63,94,0.2)]",
    bg: "bg-gradient-to-br from-rose-950 via-rose-900/60 to-black text-rose-100",
    avatar: "border-rose-400 bg-rose-500/30 text-rose-300 group-hover/header:bg-rose-500/50",
    badge: "border-rose-400/60 bg-rose-500/30 text-rose-200",
    subText: "text-rose-300 font-semibold",
  },
  {
    name: "Indigo",
    border: "border-indigo-500/70 hover:border-indigo-400 shadow-[0_10px_35px_rgba(99,102,241,0.2)]",
    bg: "bg-gradient-to-br from-indigo-950 via-indigo-900/60 to-black text-indigo-100",
    avatar: "border-indigo-400 bg-indigo-500/30 text-indigo-300 group-hover/header:bg-indigo-500/50",
    badge: "border-indigo-400/60 bg-indigo-500/30 text-indigo-200",
    subText: "text-indigo-300 font-semibold",
  },
];

export default function SubmissionsPage() {
  const router = useRouter();
  const [chiffons, setChiffons] = useState<AdminChiffon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});
  const [expandedOwners, setExpandedOwners] = useState<Record<string, boolean>>({});

  function toggleSubmissions(chiffonId: string) {
    setExpandedSubmissions((prev) => ({
      ...prev,
      [chiffonId]: !prev[chiffonId],
    }));
  }

  function toggleOwner(key: string) {
    setExpandedOwners((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  useEffect(() => {
    // Mark notifications as read when viewing SubmissionsPage
    fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});

    fetch("/api/admin/chiffons")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return [];
        }
        return res.json();
      })
      .then((data) => setChiffons(data))
      .finally(() => setLoading(false));

    // SSE for real-time updates
    const es = new EventSource("/api/admin/events");
    es.addEventListener("submission-created", () => {
      fetch("/api/admin/chiffons")
        .then((r) => r.json())
        .then((data) => setChiffons(data));
    });
    es.addEventListener("chiffon-posted", () => {
      fetch("/api/admin/chiffons")
        .then((r) => r.json())
        .then((data) => setChiffons(data));
    });

    return () => es.close();
  }, [router]);

  // Filter chiffons based on searchQuery
  const filteredChiffons = chiffons.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();

    const ownerNameMatch = c.ownerName?.toLowerCase().includes(q);
    const ownerPhoneMatch = c.ownerPhone?.toLowerCase().includes(q);
    const titleMatch = c.title?.toLowerCase().includes(q);
    const titleAmMatch = c.titleAm?.toLowerCase().includes(q);
    const descMatch = c.description?.toLowerCase().includes(q);
    const descAmMatch = c.descriptionAm?.toLowerCase().includes(q);

    const submissionMatch = c.submissions?.some((s) =>
      s.floor?.toLowerCase().includes(q) ||
      s.roomNumber?.toLowerCase().includes(q) ||
      s.packageType?.toLowerCase().includes(q) ||
      s.value?.toLowerCase().includes(q)
    );

    return (
      ownerNameMatch ||
      ownerPhoneMatch ||
      titleMatch ||
      titleAmMatch ||
      descMatch ||
      descAmMatch ||
      submissionMatch
    );
  });

  // Build owner groups, only including chiffons that have at least 1 submission
  const ownerGroupMap = new Map<string, OwnerGroup>();
  filteredChiffons.forEach((c) => {
    const uniqueCount = groupSubmissions(c.submissions || []).length;
    if (uniqueCount === 0) return;
    const name = (c.ownerName || "Unknown Owner").trim();
    const phone = (c.ownerPhone || "").trim();
    const key = `${name}_${phone}`;

    if (!ownerGroupMap.has(key)) {
      ownerGroupMap.set(key, {
        key,
        ownerName: name,
        ownerPhone: phone,
        chiffons: [],
        totalSubmissions: 0,
      });
    }
    const group = ownerGroupMap.get(key)!;
    group.chiffons.push(c);
    group.totalSubmissions += uniqueCount;
  });

  const ownerGroups = Array.from(ownerGroupMap.values());
  const grandTotal = ownerGroups.reduce((s, g) => s + g.totalSubmissions, 0);

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title="View Submissions"
        subtitle={`${grandTotal} total submission${grandTotal !== 1 ? "s" : ""} across ${ownerGroups.length} owner${ownerGroups.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
            >
              ← Back to Dashboard
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-5xl px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by owner name, phone, card title, floor, room, or package..."
              className="input-dark pl-10 pr-16 py-2.5 text-sm w-full focus:border-primary/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground text-xs font-semibold"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-border bg-card/60"
              />
            ))}
          </div>
        ) : ownerGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-4xl mb-4">{searchQuery.trim() ? "🔍" : "📭"}</p>
            <p className="text-muted text-sm">
              {searchQuery.trim()
                ? `No submissions match "${searchQuery}"`
                : "No submissions yet."}
            </p>
            {searchQuery.trim() ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-block text-primary hover:underline text-sm font-medium"
              >
                Clear search query
              </button>
            ) : (
              <Link
                href="/admin/dashboard"
                className="mt-4 inline-block text-primary hover:underline text-sm"
              >
                ← Return to dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {ownerGroups.map((group, groupIdx) => {
              const theme = SUPER_CARD_THEMES[groupIdx % SUPER_CARD_THEMES.length];
              const isExpanded = searchQuery.trim() ? true : (expandedOwners[group.key] ?? true);
              const hasMore = group.chiffons.length > 1;
              const displayedChiffons = isExpanded ? group.chiffons : group.chiffons.slice(0, 1);

              return (
                <div
                  key={group.key}
                  className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-2xl transition-all duration-300`}
                >
                  {/* Owner Card Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
                    <div
                      className="flex items-center gap-3 cursor-pointer group/header select-none"
                      onClick={() => toggleOwner(group.key)}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${theme.avatar} font-display text-lg font-bold transition shadow-lg`}
                      >
                        {group.ownerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-xl font-semibold tracking-wide text-foreground group-hover/header:text-white transition">
                            {group.ownerName}
                          </h2>
                          <span
                            className={`rounded-full border ${theme.badge} px-2.5 py-0.5 text-xs font-medium`}
                          >
                            {group.chiffons.length} chiffon{group.chiffons.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted">
                          Phone:{" "}
                          <a
                            href={toTelHref(group.ownerPhone)}
                            onClick={(e) => e.stopPropagation()}
                            className={`font-medium ${theme.subText} hover:underline`}
                          >
                            {group.ownerPhone}
                          </a>
                          <span className="mx-2 text-border">•</span>
                          <span>
                            {group.totalSubmissions} submission{group.totalSubmissions !== 1 ? "s" : ""} received
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Collapse button */}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleOwner(group.key)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-black/40 px-3.5 py-2.5 text-xs font-medium text-muted transition hover:text-foreground hover:border-muted"
                      >
                        <span>{isExpanded ? "Collapse" : `View All (${group.chiffons.length})`}</span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Chiffon Sub-cards Grid */}
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                    {displayedChiffons.map((chiffon) => {
                      const subGroups = groupSubmissions(chiffon.submissions || []);
                      const subCount = subGroups.length;
                      const isSubExpanded = searchQuery.trim() ? true : Boolean(expandedSubmissions[chiffon.id]);

                      return (
                        <article
                          key={chiffon.id}
                          className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(212,175,55,0.08)]"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-44 w-full overflow-hidden bg-black">
                            {chiffon.images[0] ? (
                              <Image
                                src={chiffon.images[0]}
                                alt={chiffon.title}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 300px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted text-sm">
                                No image
                              </div>
                            )}
                            <span className="absolute right-3 top-3 border border-primary/40 bg-black/85 px-3 py-1 text-xs font-semibold text-primary rounded-full shadow-lg">
                              {subCount} submission
                              {subCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Card Info */}
                          <div className="flex-1 p-4 flex flex-col gap-3">
                            <div>
                              <h3 className="font-display text-base tracking-wide text-foreground line-clamp-1">
                                {chiffon.title}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                                {chiffon.description}
                              </p>
                            </div>

                            {/* View Submissions Toggle */}
                            <div className="border-t border-border/50 pt-3">
                              <button
                                onClick={() => toggleSubmissions(chiffon.id)}
                                className={`w-full text-center py-2 px-3 text-xs font-medium border transition rounded-lg flex items-center justify-center gap-1.5 ${isSubExpanded
                                    ? "border-primary bg-primary/20 text-primary font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                    : "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                                  }`}
                              >
                                <span>
                                  {isSubExpanded ? "Hide Submissions" : "View Submissions"}{" "}
                                  ({subCount})
                                </span>
                                <svg
                                  className={`h-3.5 w-3.5 transition-transform duration-200 ${isSubExpanded ? "rotate-180" : ""
                                    }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Submissions Dropdown */}
                            {isSubExpanded && (
                              <div className="mt-1 border-t border-border/80 pt-3 animate-fade-in">
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                                    Submissions List ({subCount})
                                  </span>
                                  <button
                                    onClick={() => toggleSubmissions(chiffon.id)}
                                    className="text-[10px] text-muted hover:text-primary transition"
                                  >
                                    Close ✕
                                  </button>
                                </div>

                                {subCount === 0 ? (
                                  <p className="text-xs text-muted text-center py-4 bg-white/5 rounded-lg border border-border/40">
                                    No submissions yet.
                                  </p>
                                ) : (
                                  <div className="rounded-xl border border-border/60 bg-black/50 overflow-hidden shadow-inner">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="border-b border-border/60 bg-white/5 text-[11px] text-primary/90 font-semibold">
                                          <th className="py-2 pl-3 pr-2 w-12 text-center">F</th>
                                          <th className="py-2 px-2 w-14 text-center">R</th>
                                          <th className="py-2 pl-2 pr-3">P&amp;V</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/30">
                                        {subGroups.map((grp) => (
                                          <tr key={grp.key} className="hover:bg-white/5 transition-colors">
                                            <td className="py-2 pl-3 pr-2 text-center font-medium text-foreground whitespace-nowrap">
                                              {grp.floor}
                                            </td>
                                            <td className="py-2 px-2 text-center font-medium text-foreground/90 whitespace-nowrap">
                                              {grp.roomNumber}
                                            </td>
                                            <td className="py-2 pl-2 pr-3">
                                              <div className="flex flex-nowrap items-center gap-1.5">
                                                {grp.items.map((item, idx) => (
                                                  <span
                                                    key={item.id || idx}
                                                    title={`${item.packageType} (${item.value})`}
                                                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md shrink-0"
                                                  >
                                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${pkgDot(item.packageType)}`} />
                                                    <span>{pkgLabel(item.packageType)}</span>
                                                    <span className="text-foreground">({item.value})</span>
                                                  </span>
                                                ))}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Expand/Collapse footer */}
                  {hasMore && (
                    <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                      <span className="text-xs text-muted">
                        {isExpanded
                          ? `Showing all ${group.chiffons.length} chiffons`
                          : `1 of ${group.chiffons.length} chiffons shown (${group.chiffons.length - 1} hidden)`}
                      </span>
                      <button
                        onClick={() => toggleOwner(group.key)}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 hover:scale-105"
                      >
                        <span>{isExpanded ? "Collapse List ▲" : `View All ${group.chiffons.length} Chiffons ▼`}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
