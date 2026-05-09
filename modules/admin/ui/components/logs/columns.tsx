import { type logs } from "@/app/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

const columns = (page: number, limit: number): ColumnDef<logs>[] => [
    {
        accessorKey: "no",
        header: "No.",
        enableHiding: false,
        cell: ({ row }) => (page - 1) * limit + row.index + 1,
    },
    {
        accessorKey: "id",
        header: "Logs ID",
        enableHiding: false,
    },
    {
        accessorKey: "chunkId",
        header: "Chunk ID",
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        enableHiding: false,
        cell: ({ row }) => {
            const status = row.original.status!;
            return status === "failed" ? (
                <Badge variant="destructive">Error</Badge>
            ) : (
                <Badge variant="default">Success</Badge>
            );
        },
    },
    {
        accessorKey: "message",
        header: "Message",
        enableHiding: false,
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => row.original.createdAt.toLocaleString(),
    },

    {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => row.original.updatedAt.toLocaleString(),
    },
];

export default columns;
