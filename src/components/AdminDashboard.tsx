"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { AdminChiffon } from "@/lib/types";
import { toTelHref } from "@/lib/phone";
import AdminHeader from "./AdminHeader";

export default function AdminDashboard() {
  const router = useRouter();
  const [chiffons, setChiffons] = useState<AdminChiffon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsModalChiffon, setSubmissionsModalChiffon] = useState<AdminChiffon | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const totalSubmissions = chiffons.reduce(
    (sum, c) => sum + c.submissions.length,
    0,
  );

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title="Admin Dashboard"
        subtitle={`${chiffons.length} chiffons · ${totalSubmissions} submissions`}
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
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-border bg-card/60"
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
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chiffons.map((chiffon) => (
              <article
                key={chiffon.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(212,175,55,0.08)]"
              >
                <div className="relative h-48 w-full overflow-hidden bg-black">
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

                <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg tracking-wide text-foreground line-clamp-1">
                      {chiffon.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                      {chiffon.description}
                    </p>
                    <p className="mt-3 text-sm">
                      <span className="text-muted">Owner phone: </span>
                      <a
                        href={toTelHref(chiffon.ownerPhone)}
                        className="font-medium text-primary hover:underline"
                      >
                        {chiffon.ownerPhone}
                      </a>
                    </p>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => setSubmissionsModalChiffon(chiffon)}
                      className="w-full text-center py-2 px-3 text-xs font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition rounded-lg"
                    >
                      View Submissions
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/chiffons/${chiffon.id}/edit`}
                        className="text-center py-2 px-3 text-xs font-medium border border-border text-muted hover:text-foreground hover:border-muted transition rounded-lg"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(chiffon.id)}
                        className="py-2 px-3 text-xs font-medium border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/5 hover:border-red-500/50 transition rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Submissions Viewer Modal */}
      {submissionsModalChiffon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSubmissionsModalChiffon(null)} />
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
              Owner Phone:{" "}
              <a
                href={toTelHref(submissionsModalChiffon.ownerPhone)}
                className="text-primary hover:underline"
              >
                {submissionsModalChiffon.ownerPhone}
              </a>
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

      {/* Styled Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setDeleteConfirmId(null)} />
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
    </main>
  );
}
