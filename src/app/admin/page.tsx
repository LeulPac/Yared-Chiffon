"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Invalid password");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero-glow flex min-h-screen items-center justify-center px-4">
      <div className="surface-glow w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt={site.name}
            width={96}
            height={96}
            className="h-24 w-24 object-contain"
            priority
          />
          <h1 className="mt-4 font-display text-2xl tracking-wide text-primary">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-muted">Yared Chiffon Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-dark"
              placeholder="Enter admin password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full px-4 py-3 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-muted transition hover:text-primary"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
