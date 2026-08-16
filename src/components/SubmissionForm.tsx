"use client";

import { useState } from "react";
import { PACKAGE_TYPES } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

type SubmissionFormProps = {
  chiffonId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

// Fixed order: METER, TAQA, SIRY
const ORDERED_TYPES = ["METER", "TAQA", "SIRY"] as const;

export default function SubmissionForm({
  chiffonId,
  onSuccess,
  onCancel,
}: SubmissionFormProps) {
  const { t, locale } = useLanguage();
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  // Values per package — all start empty; user fills only what applies
  const [packageValues, setPackageValues] = useState<Record<string, string>>({
    METER: "",
    TAQA: "",
    SIRY: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleValueChange(type: string, val: string) {
    setPackageValues((prev) => ({ ...prev, [type]: val }));
  }

  function pkgLabel(type: string) {
    if (type === "METER") return locale === "am" ? "ሜትር" : "Meter";
    if (type === "TAQA") return "TAQA";
    if (type === "SIRY") return locale === "am" ? "ሲሪ" : "SIRY";
    return type;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!floor.trim() || !roomNumber.trim()) {
      setError(locale === "am" ? "ወለልና ክፍል ቁጥር ያስፈልጋል።" : "Floor and room number are required.");
      return;
    }

    // Only submit packages that have a filled value
    const items = ORDERED_TYPES
      .map((pt) => ({ packageType: pt, value: packageValues[pt].trim() }))
      .filter((item) => item.value.length > 0);

    if (items.length === 0) {
      setError(
        locale === "am"
          ? "ቢያንስ ለአንድ ፓኬጅ ዋጋ ያስፈልጋል።"
          : "Please fill in at least one package value."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiffonId,
          floor: floor.trim(),
          roomNumber: roomNumber.trim(),
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      if (typeof window !== "undefined") {
        const notifyData = {
          type: "submission-created",
          chiffonId,
          chiffonTitle: data.chiffonTitle || "",
          ownerName: data.ownerName || "",
          floor: data.floor || floor.trim(),
          roomNumber: data.roomNumber || roomNumber.trim(),
          timestamp: Date.now(),
        };

        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("chiffon-updates");
          channel.postMessage(notifyData);
          channel.close();
        }
        localStorage.setItem("chiffon-updates", JSON.stringify(notifyData));
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-base font-semibold text-primary tracking-wide">
        {locale === "am" ? "ቅጽ ሙሉ" : "I have this chiffon"}
      </h3>

      {/* Floor & Room */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted font-medium">
            {t("floor")} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            required
            className="input-dark !rounded-lg !px-3 !py-2 text-sm"
            placeholder="e.g. 2"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted font-medium">
            {t("roomNumber")} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            className="input-dark !rounded-lg !px-3 !py-2 text-sm"
            placeholder="e.g. 14"
          />
        </div>
      </div>

      {/* Package value inputs — all three shown, fill only what you have */}
      <div className="space-y-2.5">
        <p className="text-xs text-muted font-medium">
          {locale === "am"
            ? "የፓኬጅ ዋጋ ያስፈልጋል (ያሉህ/ያሏት ብቻ ሙሉ)"
            : "Package prices (fill only the ones you have)"}
        </p>
        {ORDERED_TYPES.map((pt) => (
          <div key={pt} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-semibold text-primary text-right">
              {pkgLabel(pt)}
            </span>
            <input
              type="text"
              value={packageValues[pt]}
              onChange={(e) => handleValueChange(pt, e.target.value)}
              className="input-dark !rounded-lg !px-3 !py-2 text-sm flex-1"
              placeholder={locale === "am" ? "ዋጋ…" : "Price…"}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm text-muted transition hover:border-primary hover:text-primary"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex-1 px-3 py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
