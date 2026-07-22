"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminChiffonForm from "./AdminChiffonForm";
import type { AdminChiffon } from "@/lib/types";

type EditChiffonClientProps = {
  id: string;
};

export default function EditChiffonClient({ id }: EditChiffonClientProps) {
  const router = useRouter();
  const [chiffon, setChiffon] = useState<AdminChiffon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/chiffons/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return null;
        }
        if (!res.ok) throw new Error("Chiffon not found");
        return res.json();
      })
      .then((data) => {
        if (data) setChiffon(data);
      })
      .catch(() => setError("Failed to load chiffon."))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-border/40" />;
  }

  if (error || !chiffon) {
    return <p className="text-sm text-red-600">{error || "Chiffon not found."}</p>;
  }

  return (
    <AdminChiffonForm
      initialData={{
        id: chiffon.id,
        title: chiffon.title,
        titleAm: chiffon.titleAm,
        description: chiffon.description,
        descriptionAm: chiffon.descriptionAm,
        ownerName: chiffon.ownerName,
        ownerPhone: chiffon.ownerPhone,
        images: chiffon.images,
      }}
      onSuccess={() => router.push("/admin/dashboard")}
    />
  );
}
