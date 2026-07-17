"use client";

import { useState } from "react";
import { PACKAGE_TYPES } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

type SubmissionFormProps = {
  chiffonId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function SubmissionForm({
  chiffonId,
  onSuccess,
  onCancel,
}: SubmissionFormProps) {
  const { t } = useLanguage();
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [value, setValue] = useState("");
  const [packageType, setPackageType] = useState("TAQA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chiffonId, floor, roomNumber, value, packageType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      if (typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("chiffon-updates");
          channel.postMessage({ type: "submission-created" });
          channel.close();
        } else {
          localStorage.setItem("chiffon-updates", Date.now().toString());
        }
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3 rounded-xl border border-border bg-black/50 p-4"
    >
      <p className="text-sm font-medium text-foreground">{t("haveThisChiffon")}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">{t("floor")}</label>
          <input
            type="text"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            required
            className="input-dark !rounded-lg !px-3 !py-2"
            placeholder="e.g. 2"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">{t("roomNumber")}</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            className="input-dark !rounded-lg !px-3 !py-2"
            placeholder="e.g. 14"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">{t("value")}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="input-dark !rounded-lg !px-3 !py-2"
          placeholder={t("enterValue")}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">{t("packageType")}</label>
        <select
          value={packageType}
          onChange={(e) => setPackageType(e.target.value)}
          className="input-dark !rounded-lg !px-3 !py-2"
        >
          {PACKAGE_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.value === "TAQA"
                ? t("packageTaqa")
                : pt.value === "SIRY"
                  ? t("packageSiry")
                  : t("packageMeter")}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex-1 px-3 py-2 text-sm disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
