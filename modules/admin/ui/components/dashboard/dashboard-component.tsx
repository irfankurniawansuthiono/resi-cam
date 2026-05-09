"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Camera, CheckCircle2, Clock, History, Loader2, Package, TrendingUp, Video, XCircle } from "lucide-react";
import { useMemo } from "react";
import { DateRange } from "react-day-picker";

interface DashboardComponentProps {
    dateRange: DateRange | undefined;
}

type Status = "recording" | "processing" | "done" | "failed";

const statusConfig: Record<
    Status,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
    recording: {
        label: "Recording",
        variant: "default",
        icon: <Video className="w-3 h-3" />,
    },
    processing: {
        label: "Processing",
        variant: "secondary",
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    done: {
        label: "Finished",
        variant: "outline",
        icon: <CheckCircle2 className="w-3 h-3 text-green-500" />,
    },
    failed: {
        label: "Failed",
        variant: "destructive",
        icon: <XCircle className="w-3 h-3" />,
    },
};

function StatusBadge({ status }: { status: Status }) {
    const cfg = statusConfig[status];
    return (
        <Badge variant={cfg.variant} className="gap-1 text-xs">
            {cfg.icon}
            {cfg.label}
        </Badge>
    );
}

function StatCard({
    title,
    value,
    description,
    icon,
    accent,
    loading,
}: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    accent: string;
    loading?: boolean;
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className={cn("absolute inset-0 opacity-5", accent)} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 rounded-lg", accent, "bg-opacity-10 text-foreground")}>{icon}</div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="text-3xl font-bold tracking-tight">{value}</div>
                )}
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

function StatusDistributionBar({ counts, total }: { counts: Record<Status, number>; total: number }) {
    const segments: { status: Status; color: string }[] = [
        { status: "done", color: "bg-green-500" },
        { status: "processing", color: "bg-yellow-400" },
        { status: "recording", color: "bg-blue-500" },
        { status: "failed", color: "bg-red-500" },
    ];

    if (total === 0) {
        return <div className="h-3 rounded-full bg-muted w-full" />;
    }

    return (
        <div className="flex h-3 rounded-full overflow-hidden w-full gap-0.5">
            {segments.map(({ status, color }) => {
                const pct = (counts[status] / total) * 100;
                if (pct === 0) return null;
                return (
                    <div
                        key={status}
                        className={cn(color, "transition-all duration-500")}
                        style={{ width: `${pct}%` }}
                        title={`${statusConfig[status].label}: ${counts[status]}`}
                    />
                );
            })}
        </div>
    );
}

export function DashboardComponent({ dateRange }: DashboardComponentProps) {
    const enabled = !!(dateRange?.from && dateRange?.to);
    const trpc = useTRPC();

    const { data, isLoading, isError } = useQuery({
        ...trpc.dashboard.get.queryOptions({
            startDate: dateRange?.from ?? new Date(),
            endDate: dateRange?.to ?? new Date(),
        }),
        enabled,
    });

    const stats = useMemo(() => {
        if (!data) return null;

        const counts: Record<Status, number> = {
            recording: data.statusCounts?.recording ?? 0,
            processing: data.statusCounts?.processing ?? 0,
            done: data.statusCounts?.done ?? 0,
            failed: data.statusCounts?.failed ?? 0,
        };
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const successRate = total > 0 ? Math.round((counts.done / total) * 100) : 0;

        return { counts, total, successRate, recentRecords: data.recentRecords ?? [] };
    }, [data]);

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (!enabled) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                <CalendarPlaceholder />
                <p className="text-sm">Pilih rentang tanggal untuk melihat data</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-destructive gap-2">
                <XCircle className="w-8 h-8" />
                <p className="text-sm">Gagal memuat data dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Records Count"
                    value={isLoading ? "—" : (stats?.total ?? 0)}
                    description="From Date Range"
                    icon={<Video className="w-4 h-4" />}
                    accent="bg-blue-500"
                    loading={isLoading}
                />
                <StatCard
                    title="Finished Count"
                    value={isLoading ? "—" : (stats?.counts.done ?? 0)}
                    description="Finished Records"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    accent="bg-green-500"
                    loading={isLoading}
                />
                <StatCard
                    title="Success Rate"
                    value={isLoading ? "—" : `${stats?.successRate ?? 0}%`}
                    description="Done / Records Total"
                    icon={<TrendingUp className="w-4 h-4" />}
                    accent="bg-emerald-500"
                    loading={isLoading}
                />
                <StatCard
                    title="Failed"
                    value={isLoading ? "—" : (stats?.counts.failed ?? 0)}
                    description="Need attention"
                    icon={<XCircle className="w-4 h-4" />}
                    accent="bg-red-500"
                    loading={isLoading}
                />
            </div>

            {/* ── Status Distribution ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recording Status Distribution</CardTitle>
                    <CardDescription>Recording Status Comparison for This Period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <Skeleton className="h-3 w-full rounded-full" />
                    ) : (
                        <StatusDistributionBar
                            counts={stats?.counts ?? { recording: 0, processing: 0, done: 0, failed: 0 }}
                            total={stats?.total ?? 0}
                        />
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        {(["done", "processing", "recording", "failed"] as Status[]).map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", {
                                        "bg-green-500": s === "done",
                                        "bg-yellow-400": s === "processing",
                                        "bg-blue-500": s === "recording",
                                        "bg-red-500": s === "failed",
                                    })}
                                />
                                <div className="flex gap-2 items-center">
                                    <span className="text-muted-foreground">{statusConfig[s].label}</span>
                                    <span className="font-semibold ml-auto">
                                        {isLoading ? "—" : (stats?.counts[s] ?? 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── Per Source Type ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <Camera size={30} className="text-muted-foreground" />
                        <div>
                            <CardTitle className="text-base">IP Camera</CardTitle>
                            <CardDescription className="text-xs">Recorded from IP Camera</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-3xl font-bold">{data?.sourceTypeCounts?.CAMERA ?? 0}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-3">
                        <Video size={30} className="text-muted-foreground" />
                        <div>
                            <CardTitle className="text-base">Webcam</CardTitle>
                            <CardDescription className="text-xs">Recorded from webcam browser</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <p className="text-3xl font-bold">{data?.sourceTypeCounts?.WEBCAM ?? 0}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Recent Records Table ── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Latest Records
                            </CardTitle>
                            <CardDescription>10 Latest Recordings in This Period</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : !stats?.recentRecords?.length ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                            <Package className="w-8 h-8 opacity-40" />
                            <p className="text-sm">There is no record in this period</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Resi</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Camera</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Recorded At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentRecords.map((record: any) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-mono text-xs font-semibold">
                                            {record.barcodeResi}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs gap-1">
                                                {record.sourceType === "CAMERA" ? (
                                                    <>
                                                        <Camera className="w-3 h-3" /> IP Cam
                                                    </>
                                                ) : (
                                                    <>
                                                        <Video className="w-3 h-3" /> Webcam
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {record.camera?.name ?? record.webCameraSession?.name ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={record.status as Status} />
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(record.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function CalendarPlaceholder() {
    return (
        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Clock className="w-6 h-6 opacity-30" />
        </div>
    );
}
