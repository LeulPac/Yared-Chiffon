"use client";

import { useState } from "react";
import Image from "next/image";

type ChiffonFormData = {
  id?: string;
  title: string;
  titleAm: string;
  description?: string;
  descriptionAm?: string;
  ownerName?: string;
  ownerPhone: string;
  images: string[];
};

type AdminChiffonFormProps = {
  initialData?: ChiffonFormData;
  onSuccess?: () => void;
};

export default function AdminChiffonForm({
  initialData,
  onSuccess,
}: AdminChiffonFormProps) {
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [titleAm, setTitleAm] = useState(initialData?.titleAm ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [descriptionAm, setDescriptionAm] = useState(initialData?.descriptionAm ?? "");
  const [ownerName, setOwnerName] = useState(initialData?.ownerName ?? "");
  const [ownerPhone, setOwnerPhone] = useState(initialData?.ownerPhone ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    if (isEditing) return;
    setTitle("");
    setTitleAm("");
    setDescription("");
    setDescriptionAm("");
    if (!initialData?.ownerName) setOwnerName("");
    if (!initialData?.ownerPhone) setOwnerPhone("");
    setImages([]);
    setError("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setImages((prev) => [...prev, ...(data?.urls ?? [])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title,
        titleAm,
        description: description.trim() || title.trim(),
        descriptionAm: descriptionAm.trim() || titleAm.trim(),
        ownerName,
        ownerPhone,
        images,
      };
      const url = isEditing ? `/api/chiffons/${initialData!.id}` : "/api/chiffons";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error ||
          `Failed to ${isEditing ? "update" : "create"} chiffon`,
        );
      }

      if (typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("chiffon-updates");
          channel.postMessage({ type: "chiffon-posted" });
          channel.close();
        } else {
          localStorage.setItem("chiffon-updates", Date.now().toString());
        }
      }

      if (isEditing) {
        setSuccess("Chiffon updated successfully.");
        onSuccess?.();
      } else {
        resetForm();
        setSuccess("Chiffon posted! Ready for another.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Owner Name <span className="text-xs text-red-400">*</span>
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            className="input-dark"
            placeholder="Owner full name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Owner Phone <span className="text-xs text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            required
            className="input-dark"
            placeholder="+251 9XX XXX XXX"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Title <span className="text-xs text-muted">(English)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-dark"
          placeholder="Chiffon name or style"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          ርዕስ <span className="text-xs text-muted">(አማርኛ)</span>
        </label>
        <input
          type="text"
          value={titleAm}
          onChange={(e) => setTitleAm(e.target.value)}
          required
          className="input-dark"
          placeholder="የሽፎኑ ስም ወይም ዓይነት"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description <span className="text-xs text-muted">(Optional, English)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="input-dark"
          placeholder="Describe the chiffon pattern, color..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          መግለጫ <span className="text-xs text-muted">(Optional, አማርኛ)</span>
        </label>
        <textarea
          value={descriptionAm}
          onChange={(e) => setDescriptionAm(e.target.value)}
          rows={2}
          className="input-dark"
          placeholder="የሽፎኑ ጥለት፣ ቀለም..."
        />
      </div>


      <div>
        <label className="mb-2 block text-sm font-medium">Images</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative h-24 w-24 overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={url}
                alt={`Upload ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-muted transition hover:border-primary hover:text-primary">
            {uploading ? "..." : "+ Add"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-primary-light">{success}</p>}

      <button
        type="submit"
        disabled={loading || !images.length}
        className="btn-gold w-full px-4 py-3 text-sm disabled:opacity-50"
      >
        {loading
          ? isEditing
            ? "Saving..."
            : "Posting..."
          : isEditing
            ? "Save Changes"
            : "Post Chiffon"}
      </button>
    </form>
  );
}
