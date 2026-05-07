import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { barcodeSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

export default function BarcodeField({
    camera,
    setRecordingStatus,
    onStartRecording,
    onStopRecording,
    setBarcode,
}: {
    camera: { id: string; url: string };
    recordingStatus: "idle" | "recording";
    setRecordingStatus: (status: "idle" | "recording") => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    setBarcode: (barcode: string) => void;
}) {
    const form = useForm({
        mode: "onChange",
        defaultValues: { barcode: "" },
        resolver: zodResolver(barcodeSchema),
    });

    const barcode = useWatch({ control: form.control, name: "barcode" });
    const debounce = useDebounce(barcode, 500);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // check valid form
        if (!form.formState.isValid) return;
        if (!debounce || debounce.trim() === "") return;
        setBarcode(debounce);

        onStopRecording();
        setTimeout(() => setRecordingStatus("recording"), 300);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(
            () => {
                onStopRecording();
                setRecordingStatus("idle");
            },
            15 * 60 * 1000,
        );

        form.reset({ barcode: "" });
    }, [debounce, onStartRecording, onStopRecording, setRecordingStatus, form.reset, form]);
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
