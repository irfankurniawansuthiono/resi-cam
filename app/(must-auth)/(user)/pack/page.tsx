import PageContainer from "@/components/custom/page-container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pack",
    description: "Start Packing",
    robots: { index: false, follow: false },
};

export default function PackPage() {
    return (
        <PageContainer pageTitle="Pack" pageDescription="Start packing and capture proof for every order">
            Pack
        </PageContainer>
    );
}
