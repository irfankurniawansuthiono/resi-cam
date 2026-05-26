import DashboardPageComponent from "@/modules/admin/ui/components/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard",
    robots: { index: false, follow: false },
};

export default function DashboardPage() {
    return <DashboardPageComponent />;
}
