import { getSession } from "@/hooks/get-session";
import { role } from "@/modules/admin/ui/config/auth/role.user";
import AdminLayout from "@/modules/admin/ui/layout/admin-layout";
import { redirect } from "next/navigation";

type AdminLayoutProps = {
    children: React.ReactNode;
};

export default async function UserLayoutWrapper({ children }: AdminLayoutProps) {
    const session = await getSession();
    const isAdminOrUser = session?.user.role === role.admin || session?.user.role === role.user;

    if (!session || !isAdminOrUser) redirect("/");

    return <AdminLayout>{children}</AdminLayout>;
}
