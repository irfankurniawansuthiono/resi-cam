import PageContainer from "@/components/custom/page-container";
import AddCameras from "@/modules/admin/ui/components/cameras/button/add-cameras";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users",
    description: "Manage user accounts in this store app",
    robots: { index: false, follow: false },
};

export default function CamerasPage() {
    return (
        <PageContainer pageTitle="Cameras" pageDescription="Manage cameras here" pageHeaderAction={<AddCameras />}>
            Cameras
        </PageContainer>
    );
}
