import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin-nav";
import { getAdminSession } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-main">{children}</div>
    </div>
  );
}
