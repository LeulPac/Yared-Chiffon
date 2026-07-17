import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import EditChiffonClient from "@/components/EditChiffonClient";
import AdminHeader from "@/components/AdminHeader";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditChiffonPage({ params }: PageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title="Edit Chiffon"
        actions={
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted transition hover:text-primary"
          >
            ← Dashboard
          </Link>
        }
      />

      <section className="mx-auto max-w-2xl px-4 py-8">
        <EditChiffonClient id={id} />
      </section>
    </main>
  );
}
