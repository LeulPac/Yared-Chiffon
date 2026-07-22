"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { AdminChiffon } from "@/lib/types";
import { toTelHref } from "@/lib/phone";
import AdminHeader from "./AdminHeader";

type OwnerGroup = {
  key: string;
  ownerName: string;
  ownerPhone: string;
  chiffons: AdminChiffon[];
  totalSubmissions: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [chiffons, setChiffons] = useState<AdminChiffon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionsModalChiffon, setSubmissionsModalChiffon] =
    useState<AdminChiffon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmOwnerGroup, setDeleteConfirmOwnerGroup] =
    useState<OwnerGroup | null>(null);

  function fetchAllChiffons() {
    fetch("/api/admin/chiffons")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setChiffons(data);
        setSubmissionsModalChiffon((currentModal) => {
          if (!currentModal) return null;
          const updated = data.find((c: AdminChiffon) => c.id === currentModal.id);
          return updated || null;
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAllChiffons();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("chiffon-updates");
      channel.onmessage = (event) => {
        if (
          event.data?.type === "submission-created" ||
          event.data?.type === "chiffon-posted"
        ) {
          fetchAllChiffons();
        }
      };
      return () => {
        channel.close();
      };
    }
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/chiffons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setChiffons((prev) => prev.filter((c) => c.id !== id));
      if (typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("chiffon-updates");
          channel.postMessage({ type: "chiffon-deleted" });
          channel.close();
        } else {
          localStorage.setItem("chiffon-updates", Date.now().toString());
        }
      }
    }
  }

  async function handleDeleteOwnerGroup(group: OwnerGroup) {
    const idsToDelete = group.chiffons.map((c) => c.id);
    await Promise.all(
      idsToDelete.map((id) => fetch(`/api/chiffons/${id}`, { method: "DELETE" }))
    );

    setChiffons((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));

    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("chiffon-updates");
        channel.postMessage({ type: "chiffon-deleted" });
        channel.close();
      } else {
        localStorage.setItem("chiffon-updates", Date.now().toString());
      }
    }
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredChiffons = chiffons.filter((c) => {
    if (!query) return true;
    const nameMatch = c.ownerName?.toLowerCase().includes(query);
    const phoneMatch = c.ownerPhone?.toLowerCase().includes(query);
    const titleMatch =
      c.title?.toLowerCase().includes(query) ||
      c.titleAm?.toLowerCase().includes(query);
    const descMatch =
      c.description?.toLowerCase().includes(query) ||
      c.descriptionAm?.toLowerCase().includes(query);
    return nameMatch || phoneMatch || titleMatch || descMatch;
  });

  // Group filtered chiffons by Owner
  const ownerGroupMap = new Map<string, OwnerGroup>();
  filteredChiffons.forEach((c) => {
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
    group.totalSubmissions += c.submissions.length;
  });

  const ownerGroups = Array.from(ownerGroupMap.values());

  const grandTotalSubmissions = chiffons.reduce(
    (sum, c) => sum + c.submissions.length,
    0,
  );

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title="Admin Dashboard"
        subtitle={`${chiffons.length} chiffons · ${ownerGroups.length} owners · ${grandTotalSubmissions} submissions`}
        actions={
          <>
            <Link
              href="/"
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
            >
              View site
            </Link>
            <Link
              href="/admin/chiffons/new"
              className="btn-gold px-4 py-2 text-sm"
            >
              + Post Chiffon
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
            >
              Logout
            </button>
          </>
        }
      />

      <section className="mx-auto max-w-5xl px-4 py-8">
        {/* Luxury Search Bar */}
        <div className="mb-8">
          <div className="group relative flex items-center rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-1.5 shadow-xl transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-[0_0_25px_rgba(212,175,55,0.15)] hover:border-primary/40">
            <div className="flex items-center justify-center pl-3.5 pr-2 text-primary/70 group-focus-within:text-primary transition-colors">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chiffon name, description, owner name, or phone..."
              className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 text-xs text-muted transition hover:bg-primary/20 hover:text-primary"
                title="Clear search"
              >
                ✕
              </button>
            ) : (
              <span className="mr-3 hidden sm:inline-block rounded-lg border border-border bg-white/5 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted/60">
                Search
              </span>
            )}
          </div>

          {query && (
            <div className="mt-3 flex items-center justify-between px-1 text-xs">
              <p className="text-muted">
                Showing <span className="font-semibold text-primary">{filteredChiffons.length}</span> chiffon{filteredChiffons.length !== 1 ? "s" : ""} across <span className="font-semibold text-primary">{ownerGroups.length}</span> owner card{ownerGroups.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted hover:text-primary transition underline text-[11px]"
              >
                Reset search
              </button>
            </div>
          )}
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
        ) : !chiffons.length ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted">No chiffons yet.</p>
            <Link
              href="/admin/chiffons/new"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Post your first chiffon →
            </Link>
          </div>
        ) : !ownerGroups.length ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-muted">No chiffons or owners match "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {ownerGroups.map((group) => (
              <div
                key={group.key}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-xl transition hover:border-primary/40"
              >
                {/* Owner Card Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary font-display text-lg font-bold">
                      {group.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-semibold tracking-wide text-foreground">
                          {group.ownerName}
                        </h2>
                        <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary font-medium">
                          {group.chiffons.length} chiffon{group.chiffons.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        Phone:{" "}
                        <a
                          href={toTelHref(group.ownerPhone)}
                          className="font-medium text-primary hover:underline"
                        >
                          {group.ownerPhone}
                        </a>
                        <span className="mx-2 text-border">•</span>
                        <span>{group.totalSubmissions} submission{group.totalSubmissions !== 1 ? "s" : ""} received</span>
                      </p>
                    </div>
                  </div>

                  {/* Owner Card Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/chiffons/new?ownerName=${encodeURIComponent(group.ownerName)}&ownerPhone=${encodeURIComponent(group.ownerPhone)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/20 hover:border-primary"
                    >
                      <span>+ Add Chiffon for {group.ownerName}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOwnerGroup(group)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:border-red-500/60"
                      title="Delete this entire owner card and all its chiffons"
                    >
                      <span>Delete Card</span>
                    </button>
                  </div>
                </div>

                {/* Owner's Chiffons Grid */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.chiffons.map((chiffon) => (
                    <article
                      key={chiffon.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card transition duration-300 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(212,175,55,0.08)]"
                    >
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
                          {chiffon.submissions.length} submission
                          {chiffon.submissions.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base tracking-wide text-foreground line-clamp-1">
                            {chiffon.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                            {chiffon.description}
                          </p>
                        </div>

                        <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
                          <button
                            onClick={() => setSubmissionsModalChiffon(chiffon)}
                            className="w-full text-center py-2 px-3 text-xs font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition rounded-lg"
                          >
                            View Submissions ({chiffon.submissions.length})
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/admin/chiffons/${chiffon.id}/edit`}
                              className="text-center py-1.5 px-3 text-xs font-medium border border-border text-muted hover:text-foreground hover:border-muted transition rounded-lg"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteConfirmId(chiffon.id)}
                              className="py-1.5 px-3 text-xs font-medium border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/5 hover:border-red-500/50 transition rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submissions Viewer Modal */}
      {submissionsModalChiffon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setSubmissionsModalChiffon(null)}
          />
          <div className="surface-glow relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-6">
            <button
              onClick={() => setSubmissionsModalChiffon(null)}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-black/70 text-primary transition hover:bg-black"
            >
              ×
            </button>
            <h2 className="font-display text-xl tracking-wide text-foreground">
              Submissions for {submissionsModalChiffon.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Owner: <span className="text-foreground font-medium">{submissionsModalChiffon.ownerName || "Unknown"}</span> (Phone:{" "}
              <a
                href={toTelHref(submissionsModalChiffon.ownerPhone)}
                className="text-primary hover:underline"
              >
                {submissionsModalChiffon.ownerPhone}
              </a>
              )
            </p>

            <div className="mt-6 overflow-x-auto">
              {submissionsModalChiffon.submissions.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  No submissions yet for this chiffon.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="pb-3 pr-4">Floor</th>
                      <th className="pb-3 pr-4">Room</th>
                      <th className="pb-3 pr-4">Value</th>
                      <th className="pb-3 pr-4">Package</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsModalChiffon.submissions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/50 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {s.floor}
                        </td>
                        <td className="py-3 pr-4">{s.roomNumber}</td>
                        <td className="py-3 pr-4">{s.value}</td>
                        <td className="py-3 pr-4">
                          <span className="text-xs border border-primary/20 bg-primary/5 px-2 py-0.5 rounded text-primary">
                            {s.packageType === "TAQA"
                              ? "ጣቃ"
                              : s.packageType === "SIRY"
                                ? "ሴሪ"
                                : "በሜትር"}
                          </span>
                        </td>
                        <td className="py-3 text-muted">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single Chiffon Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="surface-glow relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="font-display text-lg tracking-wide text-foreground">
              Delete Chiffon?
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Are you sure you want to delete this chiffon? This action is permanent
              and will delete all submissions.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 text-sm transition shadow-lg hover:shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Group / Owner Card Delete Confirmation Modal */}
      {deleteConfirmOwnerGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setDeleteConfirmOwnerGroup(null)}
          />
          <div className="surface-glow relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-card shadow-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl tracking-wide text-foreground font-semibold">
              Delete Owner Card for {deleteConfirmOwnerGroup.ownerName}?
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Are you sure you want to delete this entire owner card? This will permanently delete all{" "}
              <span className="font-semibold text-red-400">
                {deleteConfirmOwnerGroup.chiffons.length} chiffon(s)
              </span>{" "}
              and all associated customer submissions for this owner.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOwnerGroup(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteOwnerGroup(deleteConfirmOwnerGroup);
                  setDeleteConfirmOwnerGroup(null);
                }}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 text-sm transition shadow-lg hover:shadow-red-600/30"
              >
                Delete Entire Card
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
