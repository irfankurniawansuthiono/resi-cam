import { getSession } from "@/hooks/get-session";
import { role } from "@/modules/admin/ui/config/auth/role.user";
import AdminLayout from "@/modules/admin/ui/layout/admin-layout";
import { redirect } from "next/navigation";

type AdminLayoutProps = {
    children: React.ReactNode;
};

export default async function AdminLayoutWrapper({ children }: AdminLayoutProps) {
    const session = await getSession();
    const isAdmin = session?.user.role === role.admin;

    if (!isAdmin) redirect("/");

    return <AdminLayout>{children}</AdminLayout>;
}
