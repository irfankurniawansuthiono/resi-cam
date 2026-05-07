import PageContainer from "@/components/custom/page-container";
import PackRootComponents from "@/modules/user/ui/components";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pack",
    description: "Start Packing",
    robots: { index: false, follow: false },
};

export default function PackPage() {
    return (
        <PageContainer pageTitle="" pageDescription="">
            <PackRootComponents />
        </PageContainer>
    );
}
