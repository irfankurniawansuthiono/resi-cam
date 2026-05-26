import PageContainer from "@/components/custom/page-container";
import AddCameras from "@/modules/admin/ui/components/cameras/button/add-cameras";
import CamerasDataTable from "@/modules/admin/ui/components/cameras/cameras-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "IP Cameras",
    description: "Manage IP Cameras in this store app",
    robots: { index: false, follow: false },
};

export default function CamerasPage() {
    return (
        <PageContainer pageTitle="IP Cameras" pageDescription="Manage IP Cameras" pageHeaderAction={<AddCameras />}>
            <CamerasDataTable />
        </PageContainer>
    );
}
