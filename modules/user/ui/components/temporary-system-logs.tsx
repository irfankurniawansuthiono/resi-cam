import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangleIcon, CircleCheckBig, Info, Loader, Logs, ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";

export default function TemporarySystemLogs({
    systemLogs,
}: {
    systemLogs: { status: "info" | "error" | "process" | "success" | "warning"; message: string }[];
}) {
    const bottomRef = useRef<HTMLDivElement>(null);
    function generateAlerts(status: "info" | "error" | "process" | "success" | "warning", message: string) {
        switch (status) {
            case "info":
                return (
                    <Alert variant="default" className="max-w-md">
                        <Info />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            case "warning":
                return (
                    <Alert variant="warning" className="max-w-md">
                        <AlertTriangleIcon className="animate-pulse" />
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            case "error":
                return (
                    <Alert variant="destructive" className="max-w-md">
                        <ShieldAlert className="animate-ping" />
                        <AlertTitle>Error!</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            case "process":
                return (
                    <Alert variant="default" className="max-w-md">
                        <Loader />
                        <AlertTitle>Processing</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            case "success":
                return (
                    <Alert variant="success" className="max-w-md">
                        <CircleCheckBig />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            default:
                return (
                    <Alert variant="default" className="max-w-md">
                        <Info />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
        }
    }
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [systemLogs]);
    return (
        <Card className="h-full flex flex-col py-4">
            <CardContent className="flex flex-col flex-1 space-y-2">
                <CardTitle className="flex items-center gap-2">
                    <Logs size={16} />
                    Temporary System Logs
                </CardTitle>
                <CardDescription>Please contact developer if you see any errors.</CardDescription>
                <ScrollArea className="flex-1 max-h-[70svh] overflow-y-auto">
                    <div className="space-y-2">
                        {systemLogs.map((log, index) => (
                            <div key={index}>{generateAlerts(log.status, log.message)}</div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
