import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import SubmissionsPage from "@/components/SubmissionsPage";

export const metadata = {
  title: "View Submissions | Admin",
  description: "View all customer submissions grouped by owner and chiffon card.",
};

export default async function AdminSubmissionsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return <SubmissionsPage />;
}
