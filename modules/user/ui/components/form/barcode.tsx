import { appToast } from "@/components/custom/app-toast";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { barcodeSchema } from "@/lib/form-schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { SystemLog } from "..";

export default function BarcodeField({
    camera,
    setRecordingStatus,
    recordingStatus,
    onStartRecording,
    onStopRecording,
    setBarcode,
    setSystemLogs,
}: {
    camera: { id: string; url: string };
    recordingStatus: "idle" | "recording";
    setRecordingStatus: (status: "idle" | "recording") => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
    setBarcode: (barcode: string) => void;
}) {
    const form = useForm({
        mode: "onChange",
        defaultValues: { barcode: "" },
        resolver: zodResolver(barcodeSchema),
    });
    const trpc = useTRPC();

    const barcode = useWatch({ control: form.control, name: "barcode" });
    const debounce = useDebounce(barcode, 500);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const checkRecordingMutation = useMutation(
        trpc.record.check.mutationOptions({
            onSuccess: () => {
                setTimeout(() => setRecordingStatus("recording"), 300);
            },
            onError: error => {
                appToast.error(error.message);
                setSystemLogs(prev => [
                    ...prev,
                    {
                        message: "Failed to check barcode in database...\n" + error.message,
                        status: "error",
                    },
                ]);
            },
        }),
    );
    // Ambil mutate function sekali
    const { mutate: checkBarcode } = checkRecordingMutation;
    useEffect(() => {
        // check valid form
        if (!form.formState.isValid) return;
        if (!debounce || debounce.trim() === "") return;
        setBarcode(debounce);

        onStopRecording();
        checkBarcode({ barcode: debounce });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(
            () => {
                onStopRecording();
                setRecordingStatus("idle");
                // jika timeout set logs bahwa memaksa stop recording
                setSystemLogs(prev => [
                    ...prev,
                    { status: "info", message: "Force stop recording due to max duration 15 minutes reached" },
                ]);
            },
            15 * 60 * 1000,
        );
        form.reset({ barcode: "" });
    }, [
        debounce,
        form.formState.isValid,
        checkBarcode,
        setRecordingStatus,
        onStartRecording,
        onStopRecording,
        setSystemLogs,
        setBarcode,
        form,
    ]);
    return (
        <div className="flex items-center justify-end w-full gap-2">
            <Form {...form}>
                <form className="flex w-full justify-end items-center gap-2">
                    <Controller
                        name="barcode"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                className="max-w-xs"
                                {...field}
                                type="text"
                                placeholder="Scan barcode"
                                disabled={!camera?.id}
                            />
                        )}
                    />
                </form>
            </Form>
        </div>
    );
}
