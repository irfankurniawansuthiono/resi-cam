import PageContainer from "@/components/custom/page-container";
import AddUser from "@/modules/admin/ui/components/users/button/add-user";
import UsersDataTable from "@/modules/admin/ui/components/users/user-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage user accounts in this store app",
  robots: { index: false, follow: false },
};

export default function UsersPage() {
  
  
  return (
    <PageContainer
      pageTitle="Users"
      pageDescription="Manage user accounts here"
      pageHeaderAction={<AddUser/>}
    >
        <UsersDataTable/>
    </PageContainer>
  );
}
