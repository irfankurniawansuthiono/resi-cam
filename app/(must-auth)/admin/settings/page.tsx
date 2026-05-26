import PageContainer from "@/components/custom/page-container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage app settings",
    robots: { index: false, follow: false },
};

export default function PackPage() {
    return (
        <PageContainer pageTitle="Settings" pageDescription="Manage app settings">
            Settings
        </PageContainer>
    );
}
