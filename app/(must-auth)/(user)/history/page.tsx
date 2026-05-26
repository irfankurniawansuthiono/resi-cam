import PageContainer from "@/components/custom/page-container";
import PackHistoryDataTable from "@/modules/authorized/pack-history/pack-history-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pack",
    description: "Start Packing",
    robots: { index: false, follow: false },
};

export default function PackPage() {
    return (
        <PageContainer pageTitle="" pageDescription="">
            <PackHistoryDataTable />
        </PageContainer>
    );
}
