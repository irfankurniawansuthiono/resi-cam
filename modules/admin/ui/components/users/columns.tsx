import { User } from "@/app/generated/prisma";
import { ColumnDef } from "@tanstack/react-table";
import DeleteUser from "./button/delete-user";
import EditUser from "./button/edit-user";
import ResetPasswordUser from "./button/reset-password-user";
import UserRoleBadge from "./role-badge-user";

const columns = (page: number, limit: number): ColumnDef<User>[] => [
    {
        accessorKey: "no",
        header: "No.",
        enableHiding: false,
        cell: ({ row }) => (page - 1) * limit + row.index + 1,
    },
    {
        accessorKey: "name",
        header: "Full Name",
        enableHiding: false,
    },

    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => row.original.createdAt.toLocaleString(),
    },
    {
        accessorKey: "role",
        header: "Roles",
        cell: ({ row }) => {
            const userRole = row.original.role!;
            return <UserRoleBadge role={userRole} />;
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => row.original.updatedAt.toLocaleString(),
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex gap-2">
                    <EditUser
                        data={{
                            id: row.original.id,
                            name: row.original.name!,
                            email: row.original.email!,
                            role: row.original.role!,
                        }}
                    />
                    <ResetPasswordUser id={row.original.id} />
                    <DeleteUser id={row.original.id} />
                </div>
            );
        },
    },
];

export default columns;
