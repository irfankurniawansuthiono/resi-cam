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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const canvasStreamRef = useRef<MediaStream | null>(null);
    const barcodeRef = useRef(barcode);
    const canvasReadyRef = useRef(false);
    const hasStartedRecordingRef = useRef(false);
    const uploadingRef = useRef(false);

    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const [status, setStatus] = useState<CameraStatus>("idle");
    const [previewUrl, setPreviewUrl] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(() => {
        barcodeRef.current = barcode;
    }, [barcode]);

    function startCanvasOverlay() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // ✅ Tunggu sampai videoWidth benar-benar ada
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) {
            // Retry setelah frame berikutnya
            requestAnimationFrame(() => startCanvasOverlay());
            return;
        }
        canvas.width = width;
        canvas.height = height;
        // Canvas stream untuk MediaRecorder
        const canvasStream = canvas.captureStream(60);
        canvasStreamRef.current = canvasStream;
        canvasReadyRef.current = true; // canvas ready
        function drawFrame() {
            if (!ctx || !video || !canvas) return;
            // Clear canvas dulu dengan warna hitam
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const drawWidth = Math.min(canvas.width, video.videoWidth);
            const drawHeight = Math.min(canvas.height, video.videoHeight);
            const drawX = (canvas.width - drawWidth) / 2;
            const drawY = (canvas.height - drawHeight) / 2;
            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

            const now = new Date();
            const timestamp = now.toLocaleString("id-ID", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            const padding = 8;
            const fontSize = Math.max(16, canvas.width * 0.018);
            ctx.font = `bold ${fontSize}px monospace`;

            const textWidth = ctx.measureText(timestamp).width;

            const bgX = 12;
            const bgY = canvas.height - (fontSize + padding * 2) - 12;
            // Background
            ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
            ctx.beginPath();
            ctx.roundRect(bgX, bgY, textWidth + padding * 2, fontSize + padding * 2, 4);
            ctx.fill();

            // Teks — baseline sejajar dengan background
            ctx.fillStyle = "#ffffff";
            ctx.fillText(timestamp, bgX + padding, bgY + fontSize + padding - 2);

            // Barcode
            const currentBarcode = barcodeRef.current || "please scan barcode first";
            if (currentBarcode) {
                const barcodeText = `📦 ${currentBarcode}`;
                const bw = ctx.measureText(barcodeText).width;

                const bBgX = canvas.width - bw - padding * 2 - 12;
                const bBgY = canvas.height - fontSize - padding * 2 - 12;

                ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
                ctx.beginPath();
                ctx.roundRect(bBgX, bBgY, bw + padding * 2, fontSize + padding * 2, 4);
                ctx.fill();

                ctx.fillStyle = "#facc15";
                ctx.fillText(barcodeText, bBgX + padding, bBgY + fontSize + padding - 2);
            }

            animFrameRef.current = requestAnimationFrame(drawFrame);
        }

        drawFrame();
    }

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

                // ✅ Guard — kalau canvas stream belum ada, jangan lanjut
                if (!canvasStreamRef.current) {
                    setSystemLogs(prev => [...prev, { message: "Canvas stream not ready", status: "error" }]);
                    hasStartedRecordingRef.current = false;
                    return;
                }

                // ✅ Tambah audio track dari stream asli jika ada
                const audioTracks = streamRef.current?.getAudioTracks() ?? [];
                audioTracks.forEach(track => canvasStreamRef.current!.addTrack(track));

                // Buat MediaRecorder
                const recorder = new MediaRecorder(canvasStreamRef.current!, {
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

    function stopStream() {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        cancelAnimationFrame(animFrameRef.current);
        canvasStreamRef.current?.getTracks().forEach(t => t.stop());
        canvasStreamRef.current = null;
        // streamRef.current?.getTracks().forEach(t => t.stop());
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

                    // Tunggu video metadata loaded dulu
                    videoRef.current!.onloadedmetadata = () => {
                        startCanvasOverlay();
                    };
                    // Kalau sudah ready, langsung
                    if (videoRef.current!.readyState >= 2) {
                        startCanvasOverlay();
                    }
                    setSystemLogs(prev => [...prev, { status: "info", message: `Camera ${camera.name} started` }]);
                    return;
                }
            } catch (err) {
                if (cancelled) return;
                const name = (err as DOMException).name;
                setErrorMsg(ERROR_MESSAGES[name] ?? `Failed to access camera: ${(err as Error).message}`);
                setSystemLogs(prev => [
                    ...prev,
                    { status: "error", message: `Camera ${camera.name} already in used by another application` },
                ]);
                setStatus("error");
            }
        }

        startCamera();
        return () => {
            canvasReadyRef.current = false;
            cancelled = true;
            // Stop recorder di cleanup juga
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
            hasStartedRecordingRef.current = false;
            stopStream();
        };
    }, [camera, setSystemLogs]); // ← owner notes:  PLEASE DO NOT ADD startCanvasOverlay to this dependency!! it will make bugs, just ignore the ts warning (using canvas will doing rerender every fps!)

    useEffect(() => {
        function startRecording() {
            if (hasStartedRecordingRef.current) return;
            // check barcode on database
            if (!barcode) {
                appToast.error("Barcode is required");
                return;
            }
            if (!canvasReadyRef.current || !canvasStreamRef.current) {
                appToast.error("Camera not ready yet, please wait...");
                return;
            }

            hasStartedRecordingRef.current = true;

            setSystemLogs(prev => [
                ...prev,
                { status: "process", message: `Starting recording...\n${barcode}, with camera\n${camera.name}` },
            ]);

            mediaRecorderRef.current = new MediaRecorder(canvasStreamRef.current, {
                mimeType: "video/webm; codecs=vp9",
            });

            if (camera.url.startsWith("webcam")) {
                createWCSMutation.mutate({
                    id: camera.id,
                    name: camera.name,
                    url: camera.url,
                });
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
                    muted
                    className="hidden" // ← hide preview canvas
                />

                {/* Canvas - ini yang ditampilkan ke user */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-contain ${status === "active" ? "block" : "hidden"}`}
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
