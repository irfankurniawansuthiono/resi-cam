import { appToast } from "@/components/custom/app-toast";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Disc2, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CameraStatus = "idle" | "loading" | "active" | "error";

const ERROR_MESSAGES: Record<string, string> = {
    NotAllowedError: "Camera access denied. Please allow camera access in your browser settings.",
    NotFoundError: "No camera found on this device.",
    NotReadableError: "Camera is already in use by another application.",
};

export default function CameraPreview({
    camera,
    recordingStatus,
    recordingTimer,
    onStopRecording,
}: {
    camera: { id: string; url: string };
    recordingStatus: "idle" | "recording";
    recordingTimer: number;
    onStopRecording: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [status, setStatus] = useState<CameraStatus>("idle");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    function stopStream() {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }

    useEffect(() => {
        if (camera.id !== "webcam") {
            stopStream();
            return;
        }

        let cancelled = false;

        async function startCamera() {
            setStatus("loading");
            setErrorMsg("");

            try {
                // if camera == webcam
                if (camera.id === "webcam") {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (cancelled) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    setStatus("active");
                    return;
                }
            } catch (err) {
                if (cancelled) return;
                const name = (err as DOMException).name;
                setErrorMsg(ERROR_MESSAGES[name] ?? `Failed to access camera: ${(err as Error).message}`);
                appToast.error(ERROR_MESSAGES[name] ?? `Failed to access camera: ${(err as Error).message}`);
                setStatus("error");
            }
        }

        startCamera();
        return () => {
            cancelled = true;
            stopStream();
        };
    }, [camera]);

    useEffect(() => {
        function startRecording() {
            if (!streamRef.current) return;

            chunksRef.current = [];

            if (camera.id === "webcam") {
                const recorder = new MediaRecorder(streamRef.current, {
                    mimeType: "video/webm; codecs=vp9",
                });

                recorder.ondataavailable = e => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: "video/webm" });

                    // ex: preview / download
                    const url = URL.createObjectURL(blob);

                    setPreviewUrl(url);

                    // upload backend logic here
                };

                recorder.start();
                mediaRecorderRef.current = recorder;
            }
        }

        function stopRecordingInternal() {
            if (camera.id === "webcam") {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                    mediaRecorderRef.current.stop();
                }
            }
        }
        if (recordingStatus === "recording") {
            startRecording();
        }

        if (recordingStatus === "idle") {
            stopRecordingInternal();
        }
    }, [recordingStatus, camera.id]);
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state !== "inactive") {
                mediaRecorderRef.current?.stop();
            }
        };
    }, []);
    return (
        <div className="w-full space-y-4">
            <div className="relative w-full aspect-video  bg-muted rounded-lg overflow-hidden">
                {/* Video */}
                {recordingStatus === "recording" && (
                    <div className="absolute flex items-center gap-2 z-100 top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                        <Disc2 size={16} /> REC {Math.floor(recordingTimer / 60)}:
                        {(recordingTimer % 60).toString().padStart(2, "0")}
                    </div>
                )}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover ${status === "active" ? "block" : "hidden"}`}
                />

                {/* Fallback */}
                {status !== "active" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-500">
                        {status === "loading" && (
                            <p className="text-sm">
                                {camera.id === "webcam"
                                    ? "checking for camera access..."
                                    : "Connecting to IP camera..."}
                            </p>
                        )}

                        {status === "idle" && (
                            <>
                                <svg
                                    className="w-10 h-10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                                    <line x1="3" y1="3" x2="21" y2="21" />
                                </svg>
                                <p className="text-sm text-center">
                                    Select a camera from the dropdown
                                    <br />
                                    to start the preview
                                </p>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <svg
                                    className="w-10 h-10 text-red-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="text-sm text-center text-red-400 max-w-xs px-4">{errorMsg}</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="w-full flex items-start justify-between">
                <p className="text-sm italic text-muted-foreground">
                    Notes: Camera will be auto stopped after 15 minutes of inactivity
                </p>
                <ButtonWithIcon
                    onClick={() => onStopRecording()}
                    startIcon={<StopCircle />}
                    variant={"destructive"}
                    disabled={recordingStatus == "idle"}
                >
                    Stop Recording
                </ButtonWithIcon>
            </div>
            {/* preview blob */}
            {previewUrl && <video src={previewUrl} autoPlay controls />}
        </div>
    );
}
