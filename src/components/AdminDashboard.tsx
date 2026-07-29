"use client";

import { useEffect, useState, useRef } from "react";
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

  return Array.from(map.values());
}

const SUPER_CARD_THEMES = [
  {
    name: "Gold",
    border: "border-amber-500/70 hover:border-amber-400 shadow-[0_10px_35px_rgba(245,158,11,0.2)]",
    bg: "bg-gradient-to-br from-amber-950 via-amber-900/60 to-black text-amber-100",
    avatar: "border-amber-400 bg-amber-500/30 text-amber-300 group-hover/header:bg-amber-500/50",
    badge: "border-amber-400/60 bg-amber-500/30 text-amber-200",
    subBadge: "border-amber-400/50 bg-amber-500/20 text-amber-300",
    addBtn: "border-amber-400/60 bg-amber-500/30 text-amber-200 hover:bg-amber-500/50 hover:border-amber-300",
    subText: "text-amber-300 font-semibold",
  },
  {
    name: "Emerald",
    border: "border-emerald-500/70 hover:border-emerald-400 shadow-[0_10px_35px_rgba(16,185,129,0.2)]",
    bg: "bg-gradient-to-br from-emerald-950 via-emerald-900/60 to-black text-emerald-100",
    avatar: "border-emerald-400 bg-emerald-500/30 text-emerald-300 group-hover/header:bg-emerald-500/50",
    badge: "border-emerald-400/60 bg-emerald-500/30 text-emerald-200",
    subBadge: "border-emerald-400/50 bg-emerald-500/20 text-emerald-300",
    addBtn: "border-emerald-400/60 bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/50 hover:border-emerald-300",
    subText: "text-emerald-300 font-semibold",
  },
  {
    name: "Cyan",
    border: "border-cyan-500/70 hover:border-cyan-400 shadow-[0_10px_35px_rgba(6,182,212,0.2)]",
    bg: "bg-gradient-to-br from-cyan-950 via-cyan-900/60 to-black text-cyan-100",
    avatar: "border-cyan-400 bg-cyan-500/30 text-cyan-300 group-hover/header:bg-cyan-500/50",
    badge: "border-cyan-400/60 bg-cyan-500/30 text-cyan-200",
    subBadge: "border-cyan-400/50 bg-cyan-500/20 text-cyan-300",
    addBtn: "border-cyan-400/60 bg-cyan-500/30 text-cyan-200 hover:bg-cyan-500/50 hover:border-cyan-300",
    subText: "text-cyan-300 font-semibold",
  },
  {
    name: "Purple",
    border: "border-purple-500/70 hover:border-purple-400 shadow-[0_10px_35px_rgba(168,85,247,0.2)]",
    bg: "bg-gradient-to-br from-purple-950 via-purple-900/60 to-black text-purple-100",
    avatar: "border-purple-400 bg-purple-500/30 text-purple-300 group-hover/header:bg-purple-500/50",
    badge: "border-purple-400/60 bg-purple-500/30 text-purple-200",
    subBadge: "border-purple-400/50 bg-purple-500/20 text-purple-300",
    addBtn: "border-purple-400/60 bg-purple-500/30 text-purple-200 hover:bg-purple-500/50 hover:border-purple-300",
    subText: "text-purple-300 font-semibold",
  },
  {
    name: "Rose",
    border: "border-rose-500/70 hover:border-rose-400 shadow-[0_10px_35px_rgba(244,63,94,0.2)]",
    bg: "bg-gradient-to-br from-rose-950 via-rose-900/60 to-black text-rose-100",
    avatar: "border-rose-400 bg-rose-500/30 text-rose-300 group-hover/header:bg-rose-500/50",
    badge: "border-rose-400/60 bg-rose-500/30 text-rose-200",
    subBadge: "border-rose-400/50 bg-rose-500/20 text-rose-300",
    addBtn: "border-rose-400/60 bg-rose-500/30 text-rose-200 hover:bg-rose-500/50 hover:border-rose-300",
    subText: "text-rose-300 font-semibold",
  },
  {
    name: "Indigo",
    border: "border-indigo-500/70 hover:border-indigo-400 shadow-[0_10px_35px_rgba(99,102,241,0.2)]",
    bg: "bg-gradient-to-br from-indigo-950 via-indigo-900/60 to-black text-indigo-100",
    avatar: "border-indigo-400 bg-indigo-500/30 text-indigo-300 group-hover/header:bg-indigo-500/50",
    badge: "border-indigo-400/60 bg-indigo-500/30 text-indigo-200",
    subBadge: "border-indigo-400/50 bg-indigo-500/20 text-indigo-300",
    addBtn: "border-indigo-400/60 bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/50 hover:border-indigo-300",
    subText: "text-indigo-300 font-semibold",
  },
];

function getOwnerTheme(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUPER_CARD_THEMES.length;
  return SUPER_CARD_THEMES[index];
}

type SubmissionNotificationItem = {
  id: string;
  chiffonId: string;
  chiffonTitle: string;
  ownerName: string;
  floor: string;
  roomNumber: string;
  timestamp: Date;
  read: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [chiffons, setChiffons] = useState<AdminChiffon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmOwnerGroup, setDeleteConfirmOwnerGroup] =
    useState<OwnerGroup | null>(null);
  
  // Ref for event deduplication
  const lastEventKeyRef = useRef<string>("");

  // Track notifications list & modal state
  const [notificationsList, setNotificationsList] = useState<SubmissionNotificationItem[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notificationBanner, setNotificationBanner] = useState<SubmissionNotificationItem | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);
  const [highlightedChiffonId, setHighlightedChiffonId] = useState<string | null>(null);

  // Track which owner cards are expanded (showing all chiffons)
  const [expandedOwners, setExpandedOwners] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasNotificationPermission(Notification.permission === "granted");
    }
  }, []);

  function requestNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setHasNotificationPermission(permission === "granted");
      });
    }
  }

  function playChimeSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio play blocked or unsupported
    }
  }

  function scrollToAndHighlightChiffon(targetChiffonId: string) {
    if (!targetChiffonId) return;

    // Find owner group key for this chiffon and expand it
    const targetChiffon = chiffons.find((c) => c.id === targetChiffonId);
    if (targetChiffon) {
      const name = (targetChiffon.ownerName || "Unknown Owner").trim();
      const phone = (targetChiffon.ownerPhone || "").trim();
      const ownerKey = `${name}_${phone}`;
      setExpandedOwners((prev) => ({ ...prev, [ownerKey]: true }));
    }

    // Expand submission dropdown under this specific card
    setExpandedSubmissions((prev) => ({ ...prev, [targetChiffonId]: true }));

    // Set visual highlight ring
    setHighlightedChiffonId(targetChiffonId);

    // Robust polling interval to scroll as soon as React finishes mounting the card into the DOM
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.getElementById(`chiffon-card-${targetChiffonId}`);
      if (el) {
        clearInterval(interval);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (attempts > 20) {
        clearInterval(interval);
      }
    }, 100);

    // Clear highlight ring after 4.5 seconds
    setTimeout(() => {
      setHighlightedChiffonId(null);
    }, 4500);
  }

  function handleIncomingSubmissionNotification(data: any) {
    const chiffonId = data?.chiffonId || "";
    const chiffonTitle = data?.chiffonTitle || "Chiffon Item";
    const ownerName = data?.ownerName || "Owner";
    const floor = data?.floor || "";
    const roomNumber = data?.roomNumber || "";
    const timestamp = data?.timestamp || Date.now();

    // Deduplicate event triggers received within 3 seconds
    const eventKey = `${chiffonId}_${floor}_${roomNumber}_${Math.floor(timestamp / 3000)}`;
    if (lastEventKeyRef.current === eventKey) {
      return;
    }
    lastEventKeyRef.current = eventKey;
    setTimeout(() => {
      if (lastEventKeyRef.current === eventKey) {
        lastEventKeyRef.current = "";
      }
    }, 3000);

    const newNotifItem: SubmissionNotificationItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chiffonId,
      chiffonTitle,
      ownerName,
      floor,
      roomNumber,
      timestamp: new Date(),
      read: false,
    };

    setNotificationsList((prev) => [newNotifItem, ...prev]);

    // Play chime sound
    playChimeSound();

    // Trigger Device/Desktop Notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const notif = new Notification("🔔 New Chiffon Submission!", {
          body: `Submitted to: "${chiffonTitle}" (${ownerName})\nFloor: ${floor}, Room: ${roomNumber}`,
          tag: "submission-created",
        });
        notif.onclick = () => {
          if (typeof window !== "undefined") window.focus();
          scrollToAndHighlightChiffon(chiffonId);
        };
      }
    }

    // Set UI Toast Banner
    setNotificationBanner(newNotifItem);

    // Automatically scroll & focus on the specified card
    if (chiffonId) {
      scrollToAndHighlightChiffon(chiffonId);
    }
  }

  function toggleOwnerExpansion(key: string) {
    setExpandedOwners((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function toggleSubmissions(chiffonId: string) {
    setExpandedSubmissions((prev) => ({
      ...prev,
      [chiffonId]: !prev[chiffonId],
    }));
  }

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
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAllChiffons();

    function processEvent(data: any) {
      if (data?.type === "submission-created") {
        fetchAllChiffons();
        handleIncomingSubmissionNotification(data);
      } else if (data?.type === "chiffon-posted") {
        fetchAllChiffons();
      }
    }

    if (typeof window !== "undefined") {
      let channel: BroadcastChannel | null = null;
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("chiffon-updates");
        channel.onmessage = (event) => {
          processEvent(event.data);
        };
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === "chiffon-updates" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            processEvent(parsed);
          } catch {
            fetchAllChiffons();
          }
        }
      };

      window.addEventListener("storage", handleStorage);

      return () => {
        if (channel) channel.close();
        window.removeEventListener("storage", handleStorage);
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

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen bg-background relative">
      {/* Floating Notification Toast Banner for Real-time Submissions */}
      {notificationBanner && (
        <div
          onClick={() => scrollToAndHighlightChiffon(notificationBanner.chiffonId)}
          className="fixed top-5 right-5 z-50 max-w-md cursor-pointer animate-bounce-in rounded-2xl border border-primary/60 bg-black/95 p-4 text-foreground shadow-[0_10px_40px_rgba(212,175,55,0.45)] backdrop-blur-md hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/20 text-xl text-primary animate-pulse">
                🔔
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <span>New Submission Received!</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-normal">
                    Click to view →
                  </span>
                </h4>
                <p className="mt-0.5 text-xs text-foreground/90">
                  Card: <span className="font-bold text-white">{notificationBanner.chiffonTitle}</span> ({notificationBanner.ownerName})
                </p>
                <p className="text-[11px] text-muted">
                  Floor {notificationBanner.floor} • Room {notificationBanner.roomNumber}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotificationBanner(null);
              }}
              className="text-xs text-muted hover:text-white transition p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Notification Center Pop-up Modal / Drawer */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setShowNotificationModal(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border border-primary/50 bg-card shadow-2xl overflow-hidden mt-16 sm:mt-14">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 p-4 bg-black/60">
              <div className="flex items-center gap-2">
                <span className="text-lg text-primary">🔔</span>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Submissions Notifications ({notificationsList.length})
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {notificationsList.length > 0 && (
                  <button
                    onClick={() => setNotificationsList([])}
                    className="text-[11px] text-muted hover:text-red-400 transition"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs text-muted hover:text-foreground transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notificationsList.length === 0 ? (
                <div className="py-12 text-center text-muted text-xs">
                  No notifications yet. New submissions will appear here.
                </div>
              ) : (
                notificationsList.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      setShowNotificationModal(false);
                      scrollToAndHighlightChiffon(notif.chiffonId);
                    }}
                    className="w-full text-left group flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition bg-black/60 hover:bg-primary/15 border border-border/70 hover:border-primary/50 shadow-sm active:scale-[0.98] select-none"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary group-hover:scale-105 transition">
                      🔔
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-primary truncate">
                          {notif.chiffonTitle}
                        </h4>
                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground/90 font-medium">
                        Owner: {notif.ownerName}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Floor: <span className="text-foreground font-semibold">{notif.floor}</span> • Room:{" "}
                        <span className="text-foreground font-semibold">{notif.roomNumber}</span>
                      </p>
                      <span className="mt-1 inline-block text-[10px] font-semibold text-primary group-hover:underline">
                        View Card →
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AdminHeader
        title="Admin Dashboard"
        subtitle={`${chiffons.length} chiffons · ${ownerGroups.length} owners · ${grandTotalSubmissions} submissions`}
        actions={
          <>
            {/* Notification Bell Button */}
            <button
              onClick={() => {
                setShowNotificationModal((prev) => !prev);
                setNotificationsList((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                );
              }}
              className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-primary/40 bg-black/60 text-primary transition hover:bg-primary/20 hover:border-primary"
              title="View Submission Notifications"
            >
              <span className="text-base">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {!hasNotificationPermission && (
              <button
                onClick={requestNotificationPermission}
                className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                title="Enable browser & device alerts for new submissions"
              >
                🔔 Enable Device Alerts
              </button>
            )}
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
            {ownerGroups.map((group, groupIdx) => {
              const theme = SUPER_CARD_THEMES[groupIdx % SUPER_CARD_THEMES.length];
              const isExpanded = expandedOwners[group.key] || Boolean(query);
              const displayedChiffons = isExpanded
                ? group.chiffons
                : group.chiffons.slice(0, 1);
              const hasMore = group.chiffons.length > 1;

              return (
                <div
                  key={group.key}
                  className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-2xl transition-all duration-300`}
                >
                  {/* Owner Card Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
                    <div
                      className="flex items-center gap-3 cursor-pointer group/header select-none"
                      onClick={() => toggleOwnerExpansion(group.key)}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${theme.avatar} font-display text-lg font-bold transition shadow-lg`}>
                        {group.ownerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-xl font-semibold tracking-wide text-foreground group-hover/header:text-white transition">
                            {group.ownerName}
                          </h2>
                          <span className={`rounded-full border ${theme.badge} px-2.5 py-0.5 text-xs font-medium`}>
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
                          <span>{group.totalSubmissions} submission{group.totalSubmissions !== 1 ? "s" : ""} received</span>
                        </p>
                      </div>
                    </div>

                    {/* Owner Card Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {hasMore && !query && (
                        <button
                          type="button"
                          onClick={() => toggleOwnerExpansion(group.key)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-black/40 px-3.5 py-2.5 text-xs font-medium text-muted transition hover:text-foreground hover:border-muted"
                        >
                          <span>{isExpanded ? "Collapse" : `View All (${group.chiffons.length})`}</span>
                          <svg
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}

                      <Link
                        href={`/admin/chiffons/new?ownerName=${encodeURIComponent(group.ownerName)}&ownerPhone=${encodeURIComponent(group.ownerPhone)}`}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border ${theme.addBtn} px-4 py-2.5 text-xs font-semibold transition shadow-md`}
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

                  {/* Owner's Chiffons Grid (1 preview card by default, or all if expanded) */}
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                    {displayedChiffons.map((chiffon) => (
                      <article
                        key={chiffon.id}
                        id={`chiffon-card-${chiffon.id}`}
                        className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all duration-500 ${
                          highlightedChiffonId === chiffon.id
                            ? "border-primary ring-4 ring-primary/60 shadow-[0_0_35px_rgba(212,175,55,0.6)] scale-[1.02]"
                            : "border-border hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(212,175,55,0.08)]"
                        }`}
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
                              onClick={() => toggleSubmissions(chiffon.id)}
                              className={`w-full text-center py-2 px-3 text-xs font-medium border transition rounded-lg flex items-center justify-center gap-1.5 ${
                                expandedSubmissions[chiffon.id]
                                  ? "border-primary bg-primary/20 text-primary font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                  : "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                              }`}
                            >
                              <span>
                                {expandedSubmissions[chiffon.id]
                                  ? "Hide Submissions"
                                  : "View Submissions"}{" "}
                                ({chiffon.submissions.length})
                              </span>
                              <svg
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                  expandedSubmissions[chiffon.id] ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
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

                          {/* Submissions Dropdown Panel */}
                          {expandedSubmissions[chiffon.id] && (
                            <div className="mt-3 border-t border-border/80 pt-3 animate-fade-in">
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                                  Submissions List ({chiffon.submissions.length})
                                </span>
                                <button
                                  onClick={() => toggleSubmissions(chiffon.id)}
                                  className="text-[10px] text-muted hover:text-primary transition"
                                >
                                  Close ✕
                                </button>
                              </div>

                              {chiffon.submissions.length === 0 ? (
                                <p className="text-xs text-muted text-center py-4 bg-white/5 rounded-lg border border-border/40">
                                  No submissions yet for this chiffon.
                                </p>
                              ) : (
                                <div className="overflow-x-auto rounded-xl border border-border/60 bg-black/50 p-2 shadow-inner">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="border-b border-border/60 text-muted/80 text-[11px]">
                                        <th className="pb-2 pl-2 pr-2 font-semibold">
                                          Floor
                                        </th>
                                        <th className="pb-2 pr-2 font-semibold">
                                          Room
                                        </th>
                                        <th className="pb-2 pr-2 font-semibold">
                                          Package &amp; Value
                                        </th>
                                        <th className="pb-2 pr-2 font-semibold text-right">
                                          Date
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                      {groupSubmissions(chiffon.submissions).map(
                                        (group) => (
                                          <tr
                                            key={group.key}
                                            className="hover:bg-white/5 transition-colors"
                                          >
                                            <td className="py-2 pl-2 pr-2 font-medium text-foreground whitespace-nowrap">
                                              {group.floor}
                                            </td>
                                            <td className="py-2 pr-2 text-foreground/90 whitespace-nowrap">
                                              {group.roomNumber}
                                            </td>
                                            <td className="py-2 pr-2">
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                {group.items.map((item, idx) => (
                                                  <span
                                                    key={item.id || idx}
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium border border-primary/40 bg-primary/10 text-primary px-2 py-0.5 rounded-md"
                                                  >
                                                    <span>
                                                      {item.packageType === "TAQA"
                                                        ? "TAQA"
                                                        : item.packageType === "SIRY"
                                                          ? "SIRY"
                                                          : item.packageType ===
                                                              "METER"
                                                            ? "METER"
                                                            : item.packageType}
                                                    </span>
                                                    <span className="text-foreground font-semibold">
                                                      ({item.value})
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            </td>
                                            <td className="py-2 pr-2 text-right text-muted whitespace-nowrap text-[11px]">
                                              {new Date(
                                                group.createdAt
                                              ).toLocaleDateString()}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Expand / Collapse Footer Trigger if Owner has multiple chiffons */}
                  {hasMore && !query && (
                    <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                      <span className="text-xs text-muted">
                        {isExpanded
                          ? `Showing all ${group.chiffons.length} chiffons`
                          : `1 of ${group.chiffons.length} chiffons shown (${group.chiffons.length - 1} hidden)`}
                      </span>
                      <button
                        onClick={() => toggleOwnerExpansion(group.key)}
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
