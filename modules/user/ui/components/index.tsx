"use client";
import { useEffect, useState } from "react";
import CameraPreview from "./camera-preview";
import BarcodeField from "./form/barcode";
import CameraSelect from "./form/camera-select";

export default function PackRootComponents() {
    const [camera, setCamera] = useState({ id: "", url: "" });
    const [barcode, setBarcode] = useState("");
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording">("idle");
    const [recordingTimer, setRecordingTimer] = useState(0);

    const startRecording = () => {
        setRecordingTimer(0);
        setRecordingStatus("recording");
    };

    const stopRecording = () => {
        setRecordingStatus("idle");
    };
    useEffect(() => {
        if (recordingStatus !== "recording") return;

        const interval = setInterval(() => {
            setRecordingTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [recordingStatus]);
    return (
        <div className=" max-w-[80%] space-y-4 ">
            <div className="flex items-center justify-between">
                <CameraSelect setCamera={setCamera} camera={camera} />
                <BarcodeField
                    camera={camera}
                    recordingStatus={recordingStatus}
                    setRecordingStatus={setRecordingStatus}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                />
            </div>
            <CameraPreview
                camera={camera}
                recordingStatus={recordingStatus}
                recordingTimer={recordingTimer}
                onStopRecording={stopRecording}
            />
        </div>
    );
}
