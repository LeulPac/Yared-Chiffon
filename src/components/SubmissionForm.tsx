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
  
  // Track selected package types (can select multiple)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["TAQA"]);
  // Track value for each selected package type
  const [packageValues, setPackageValues] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function togglePackage(typeValue: string) {
    if (selectedTypes.includes(typeValue)) {
      // Prevent unselecting if it's the last selected one
      if (selectedTypes.length === 1) return;
      setSelectedTypes((prev) => prev.filter((t) => t !== typeValue));
    } else {
      setSelectedTypes((prev) => [...prev, typeValue]);
    }
  }

  function handleValueChange(typeValue: string, val: string) {
    setPackageValues((prev) => ({
      ...prev,
      [typeValue]: val,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedTypes.length) {
      setError("Please select at least one package type.");
      return;
    }

    // Check that every selected package has a filled value
    for (const pt of selectedTypes) {
      const val = packageValues[pt]?.trim();
      if (!val) {
        const label =
          pt === "TAQA"
            ? t("packageTaqa")
            : pt === "SIRY"
              ? t("packageSiry")
              : t("packageMeter");
        setError(`Please fill in the value for ${label}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const items = selectedTypes.map((pt) => ({
        packageType: pt,
        value: packageValues[pt].trim(),
      }));

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
      className="mt-4 space-y-4 rounded-xl border border-border bg-black/60 p-4 shadow-xl backdrop-blur-md"
    >
      <p className="text-sm font-semibold text-foreground">{t("haveThisChiffon")}</p>

      {/* Floor & Room Number */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted font-medium">{t("floor")} *</label>
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
          <label className="mb-1 block text-xs text-muted font-medium">{t("roomNumber")} *</label>
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

      {/* Package Type Horizontal Selection Buttons */}
      <div>
        <label className="mb-1.5 block text-xs text-muted font-medium">
          {t("packageType")} <span className="text-[10px] text-primary/70">(Select one or multiple)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PACKAGE_TYPES.map((pt) => {
            const isSelected = selectedTypes.includes(pt.value);
            const label =
              pt.value === "TAQA"
                ? t("packageTaqa")
                : pt.value === "SIRY"
                  ? t("packageSiry")
                  : t("packageMeter");

            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => togglePackage(pt.value)}
                className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                    : "border-border/70 bg-white/5 text-muted hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-Package Value Inputs */}
      <div className="space-y-3 pt-1">
        {selectedTypes.map((pt) => {
          const label =
            pt === "TAQA"
              ? t("packageTaqa")
              : pt === "SIRY"
                ? t("packageSiry")
                : t("packageMeter");

          return (
            <div key={pt} className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <label className="mb-1 block text-xs font-medium text-primary">
                {t("value")} for {label} *
              </label>
              <input
                type="text"
                value={packageValues[pt] ?? ""}
                onChange={(e) => handleValueChange(pt, e.target.value)}
                required
                className="input-dark !rounded-lg !px-3 !py-2 text-sm"
                placeholder={`${t("enterValue")} for ${label}`}
              />
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-2">
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
