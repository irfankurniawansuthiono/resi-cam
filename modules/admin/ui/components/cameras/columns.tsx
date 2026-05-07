import { type Camera } from "@/app/generated/prisma";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DeleteCamera from "./button/delete-camera";
import EditCamera from "./button/edit-cameras";

const columns = (page: number, limit: number): ColumnDef<Camera>[] => [
    {
        accessorKey: "no",
        header: "No.",
        enableHiding: false,
        cell: ({ row }) => (page - 1) * limit + row.index + 1,
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => row.original.createdAt.toLocaleString(),
    },
    {
        accessorKey: "name",
        header: "Camera Name",
        enableHiding: false,
    },
    {
        accessorKey: "url",
        header: "Camera URL",
        enableHiding: false,
        cell: ({ row }) => {
            const url = new URL(row.original.url || "#");
            return (
                <Link className="underline text-accent-foreground" href={url} target="_blank" rel="noopener noreferrer">
                    {url.hostname}/{url.pathname}
                </Link>
            );
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
                    <EditCamera
                        data={{
                            id: row.original.id,
                            name: row.original.name!,
                            url: row.original.url!,
                        }}
                    />
                    <DeleteCamera id={row.original.id} />
                </div>
            );
        },
    },
];

export default columns;
