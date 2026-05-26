import type { RecordListItem } from "@/trpc/routers/recording";
import { ColumnDef } from "@tanstack/react-table";
import { Cctv, Webcam } from "lucide-react";
import PreviewVideoPack from "./button/preview-video-pack";

const columns = (page: number, limit: number): ColumnDef<RecordListItem>[] => [
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
        accessorKey: "barcodeResi",
        header: "No. Resi",
        enableHiding: false,
        cell: ({ row }) => {
            return <p className="font-mono">{row.original.barcodeResi}</p>;
        },
    },
    {
        accessorKey: "recordedBy.name",
        header: "Recorded By",
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        enableHiding: false,
    },
    {
        accessorKey: "sourceType",
        header: "Camera Source",
        enableHiding: false,
        cell: ({ row }) => {
            const cameraSource = row.original.sourceType;
            return cameraSource === "CAMERA" ? (
                <div className="flex items-center gap-1">
                    <Cctv size={15} />
                    <p>IP Camera</p>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <Webcam size={15} className="mr-2 h-4 w-4" /> Web Camera
                </div>
            );
        },
    },
    {
        accessorFn: row => (row.camera ? row.camera.name : row.webCameraSession?.name),
        header: "Camera Name",
        enableHiding: false,
    },
    {
        accessorKey: "videoPath",
        header: "Video",
        cell: ({ row }) => {
            return <PreviewVideoPack videoSource={row.original.videoPath} barcodeResi={row.original.barcodeResi} />;
        },
    },
];

export default columns;
