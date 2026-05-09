import PageContainer from "@/components/custom/page-container";
import LogsDataTable from "@/modules/admin/ui/components/logs/logs-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Error Logs",
    description: "Logs of system failures",
    robots: { index: false, follow: false },
};

export default function LogsPage() {
    return (
        <PageContainer pageTitle="System Error Logs" pageDescription="Logs of system failures" pageHeaderAction={<></>}>
            <LogsDataTable />
        </PageContainer>
    );
}
