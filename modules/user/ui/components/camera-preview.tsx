import { appToast } from "@/components/custom/app-toast";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangleIcon, Disc2, StopCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SystemLog } from ".";
type CameraStatus = "idle" | "loading" | "active" | "error";

const ERROR_MESSAGES: Record<string, string> = {
    NotAllowedError: "Camera access denied. Please allow camera access in your browser settings.",
    NotFoundError: "No camera found on this device.",
    NotReadableError: "Camera is already in use by another application.",
};
type UploadChunk = {
    blob: Blob;
    index: number;
    sessionId: string;
};
export default function CameraPreview({
    camera,
    setSystemLogs,
    recordingStatus,
    recordingTimer,
    barcode,
    onStopRecording,
}: {
    camera: { id: string; url: string; name: string };
    recordingStatus: "idle" | "recording";
    recordingTimer: number;
    setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
    barcode: string;
    onStopRecording: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [status, setStatus] = useState<CameraStatus>("idle");
    const [previewUrl, setPreviewUrl] = useState("");
    const hasStartedRecordingRef = useRef(false);
    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = useState("");
    const trpc = useTRPC();

    const createRecordingMutation = useMutation(
        trpc.record.create.mutationOptions({
            onSuccess: () => {
                setSystemLogs(prev => [
                    ...prev,
                    {
                        message: "Adding barcode to database...",
                        status: "info",
                    },
                ]);
                queryClient.invalidateQueries(trpc.record.get.queryFilter());
            },
            onError: () => {},
        }),
    );
    const createWCSMutation = useMutation(
        trpc.wcs.create.mutationOptions({
            onSuccess: data => {
                setSystemLogs(prev => [
                    ...prev,
                    { message: `Web Camera Session created: ${data.name}`, status: "info" },
                ]);

                // Gunakan data.id dari server sebagai sessionId
                const sessionId = data.id;
                let chunkIndex = 0;
                const queue: UploadChunk[] = [];

                async function processQueue() {
                    if (uploadingRef.current) return;
                    uploadingRef.current = true;
                    while (queue.length > 0) {
                        const chunk = queue.shift();
                        if (!chunk) continue;
                        try {
                            await uploadChunk(chunk);
                        } catch {
                            queue.unshift(chunk);
                            break;
                        }
                    }
                    uploadingRef.current = false;
                }

                if (!streamRef.current) return;
                const recorder = new MediaRecorder(streamRef.current, {
                    mimeType: "video/webm; codecs=vp8",
                });

                recorder.ondataavailable = e => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                        queue.push({ blob: e.data, index: chunkIndex++, sessionId });
                        processQueue();
                    }
                };

                recorder.onstop = async () => {
                    try {
                        const res = await axios.post("/api/complete-upload", {
                            sessionId,
                            barcode,
                        });
                        setPreviewUrl(res.data.output);
                        if (res.status === 200) {
                            setSystemLogs(prev => [
                                ...prev,
                                { status: "success", message: `Barcode ${barcode} uploaded to database, Video merged` },
                            ]);
                            queryClient.invalidateQueries(trpc.record.get.queryFilter());
                        }
                    } catch (err) {
                        if (axios.isAxiosError(err) && err.response?.status === 422) {
                            appToast.error("Video is too short. Minimum 10 seconds.");
                            setSystemLogs(prev => [
                                ...prev,
                                { status: "error", message: "Video is too short. Minimum 10 seconds." },
                            ]);
                        } else {
                            appToast.error("Failed to merge chunks.");
                            setSystemLogs(prev => [...prev, { status: "error", message: "Failed to merge chunks." }]);
                        }
                    }
                };

                recorder.start(2000);
                mediaRecorderRef.current = recorder;

                // Baru create record setelah recorder siap
                createRecordingMutation.mutate({
                    barcodeResi: barcode,
                    videoPath: "#",
                    status: "recording",
                    sourceType: "WEBCAM",
                    cameraId: undefined,
                    webCameraSessionId: data.id,
                });
            },
            onError: () => {
                hasStartedRecordingRef.current = false; // reset guard kalau gagal
                setSystemLogs(prev => [...prev, { message: "Failed to create Web Camera Session", status: "error" }]);
            },
        }),
    );
    const uploadingRef = useRef(false);
    function stopStream() {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }

    const uploadChunk = useCallback(
        async (chunk: UploadChunk) => {
            const formData = new FormData();
            formData.append("file", chunk.blob);
            formData.append("index", String(chunk.index));
            formData.append("sessionId", chunk.sessionId);

            try {
                await axios.post("/api/upload-chunk", formData, {
                    timeout: 10000,
                });
            } catch (err) {
                setSystemLogs(prev => [...prev, { status: "error", message: `Failed to upload chunk ${chunk.index}` }]);
                console.error(err);
                throw err;
            }
        },
        [setSystemLogs],
    );

    useEffect(() => {
        if (!camera.url.startsWith("webcam")) {
            // Stop recorder lama juga saat kamera bukan webcam
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
            hasStartedRecordingRef.current = false; // ← tambahkan ini
            stopStream();
            return;
        }

        let cancelled = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }
        hasStartedRecordingRef.current = false; // ← reset guard di sini
        chunksRef.current = [];
        async function startCamera() {
            setStatus("loading");
            setErrorMsg("");

            try {
                if (camera.url.startsWith("webcam")) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: { exact: camera.id },
                        },
                    });
                    if (cancelled) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }

                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    setStatus("active");
                    setSystemLogs(prev => [...prev, { status: "info", message: `Camera ${camera.name} started` }]);
                    return;
                }
            } catch (err) {
                if (cancelled) return;
                const name = (err as DOMException).name;
                setErrorMsg(ERROR_MESSAGES[name] ?? `Failed to access camera: ${(err as Error).message}`);
                setStatus("error");
            }
        }

        startCamera();
        return () => {
            cancelled = true;
            // Stop recorder di cleanup juga
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
            hasStartedRecordingRef.current = false;
            stopStream();
        };
    }, [camera, setSystemLogs]);

    useEffect(() => {
        function startRecording() {
            if (hasStartedRecordingRef.current) return;
            // check barcode on database
            if (!barcode) {
                appToast.error("Barcode is required");
                return;
            }

            hasStartedRecordingRef.current = true;

            setSystemLogs(prev => [
                ...prev,
                { status: "process", message: `Starting recording...\n${barcode}, with camera\n${camera.name}` },
            ]);

            if (!streamRef.current) return;

            if (camera.url.startsWith("webcam")) {
                createWCSMutation.mutate({
                    id: camera.id,
                    name: camera.name,
                    url: camera.url,
                });
                // MediaRecorder sekarang diinit di onSuccess ↑
            }
        }

        function stopRecordingInternal() {
            hasStartedRecordingRef.current = false;
            if (camera.url.startsWith("webcam")) {
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
    }, [recordingStatus, camera, setSystemLogs, barcode, createWCSMutation, uploadChunk]);

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
                    <div className="absolute flex items-center gap-2 z-2 top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                        <Disc2 size={16} /> REC {Math.floor(recordingTimer / 60)}:
                        {(recordingTimer % 60).toString().padStart(2, "0")}
                    </div>
                )}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`absolute inset-0  w-full h-full object-cover ${status === "active" ? "block" : "hidden"}`}
                />

                {/* Fallback */}
                {status !== "active" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-500">
                        {status === "loading" && (
                            <p className="text-sm">
                                {camera.url.startsWith("webcam")
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
                <Alert className="max-w-fit border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                    <AlertTriangleIcon />
                    <AlertTitle>Recording Instructions</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            <li>
                                Minimum duration is <b>10 seconds</b>
                            </li>
                            <li>
                                Recording will be auto stopped after <b>15 minutes </b>of <b>inactivity</b>
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>
                <ButtonWithIcon
                    onClick={() => onStopRecording()}
                    startIcon={<StopCircle />}
                    variant={"destructive"}
                    disabled={recordingStatus == "idle"}
                >
                    Stop Recording
                </ButtonWithIcon>
            </div>
            {/* {previewUrl && (
                <div>
                    <p>Preview :</p>
                    <video controls src={previewUrl} />
                </div>
            )} */}
        </div>
    );
}
