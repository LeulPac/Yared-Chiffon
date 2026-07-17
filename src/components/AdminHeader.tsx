import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function AdminHeader({
  title,
  subtitle,
  actions,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-border bg-black/95">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="shrink-0">
            <Image
              src="/logo.png"
              alt={site.name}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </Link>
          <div>
            <h1 className="font-display text-xl tracking-wide text-primary">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
