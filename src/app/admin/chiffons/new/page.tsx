import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminChiffonForm from "@/components/AdminChiffonForm";
import AdminHeader from "@/components/AdminHeader";

export default async function NewChiffonPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title="Post New Chiffon"
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
        <AdminChiffonForm />
      </section>
    </main>
  );
}
