import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminChiffonForm from "@/components/AdminChiffonForm";
import AdminHeader from "@/components/AdminHeader";

type NewChiffonPageProps = {
  searchParams: Promise<{ ownerName?: string; ownerPhone?: string }>;
};

export default async function NewChiffonPage({ searchParams }: NewChiffonPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { ownerName = "", ownerPhone = "" } = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader
        title={ownerName ? `Post Chiffon for ${ownerName}` : "Post New Chiffon"}
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
        <AdminChiffonForm
          initialData={
            ownerName || ownerPhone
              ? {
                  title: "",
                  titleAm: "",
                  description: "",
                  descriptionAm: "",
                  ownerName,
                  ownerPhone,
                  images: [],
                }
              : undefined
          }
        />
      </section>
    </main>
  );
}
