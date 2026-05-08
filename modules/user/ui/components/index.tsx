"use client";
import { useEffect, useState } from "react";
import CameraPreview from "./camera-preview";
import BarcodeField from "./form/barcode";
import CameraSelect from "./form/camera-select";
import TemporarySystemLogs from "./temporary-system-logs";

export type SystemLog = {
    status: "info" | "error" | "process" | "success";
    message: string;
};

export default function PackRootComponents() {
    const [camera, setCamera] = useState({ id: "", name: "", url: "" });
    const [barcode, setBarcode] = useState("");
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording">("idle");
    const [recordingTimer, setRecordingTimer] = useState(0);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

    const startRecording = () => {
        setRecordingTimer(0);
        setRecordingStatus("recording");
    };

    const stopRecording = () => {
        setRecordingStatus("idle");
        setRecordingTimer(0);
    };
    useEffect(() => {
        if (recordingStatus !== "recording") return;

        const interval = setInterval(() => {
            setRecordingTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [recordingStatus]);

    return (
        <div className="flex justify-between w-full gap-4 h-full">
            <div className="w-full flex-3 space-y-4 ">
                <div className="flex items-center justify-between">
                    <CameraSelect
                        recordingStatus={recordingStatus}
                        setCamera={setCamera}
                        camera={camera}
                        systemLogs={systemLogs}
                        setSystemLogs={setSystemLogs}
                    />
                    <BarcodeField
                        setBarcode={setBarcode}
                        camera={camera}
                        setSystemLogs={setSystemLogs}
                        recordingStatus={recordingStatus}
                        setRecordingStatus={setRecordingStatus}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                    />
                </div>
                <CameraPreview
                    setSystemLogs={setSystemLogs}
                    barcode={barcode}
                    camera={camera}
                    recordingStatus={recordingStatus}
                    recordingTimer={recordingTimer}
                    onStopRecording={stopRecording}
                />
            </div>
            <div className="w-full flex-1 ">
                <TemporarySystemLogs systemLogs={systemLogs} />
            </div>
        </div>
    );
}
