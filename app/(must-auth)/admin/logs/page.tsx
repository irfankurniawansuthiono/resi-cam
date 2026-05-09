import PageContainer from "@/components/custom/page-container";
import LogsDataTable from "@/modules/admin/ui/components/logs/logs-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "IP Cameras",
    description: "Manage IP Cameras in this store app",
    robots: { index: false, follow: false },
};

export default function CamerasPage() {
    return (
        <PageContainer pageTitle="System Error Logs" pageDescription="LOgs of system failures" pageHeaderAction={<></>}>
            <LogsDataTable />
        </PageContainer>
    );
}
