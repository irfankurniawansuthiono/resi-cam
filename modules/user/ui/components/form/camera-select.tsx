/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Form, FormLabel } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCameras } from "@/hooks/use-camera";
import { Camera, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { SystemLog } from "..";
export default function CameraSelect({
    setCamera,
    camera,
    setSystemLogs,
    recordingStatus,
}: {
    setCamera: (camera: { id: string; url: string; name: string }) => void;
    camera: { id: string; url: string; name: string };
    systemLogs: SystemLog[];
    recordingStatus: "idle" | "recording";
    setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
}) {
    const [webcamList, setWebcamList] = useState<MediaDeviceInfo[]>([]);
    const form = useForm({
        defaultValues: {
            camera: "",
        },
        mode: "onChange",
    });
    useEffect(() => {
        async function load() {
            setSystemLogs(prev => [...prev, { status: "process", message: "Loading cameras..." }]);

            try {
                await navigator.mediaDevices.getUserMedia({ video: true });

                const devices = await navigator.mediaDevices.enumerateDevices();

                setWebcamList(devices.filter(d => d.kind === "videoinput"));

                setSystemLogs(prev => [...prev, { status: "info", message: "Web Cameras loaded" }]);
            } catch (error) {
                console.error(error);
                setSystemLogs(prev => [...prev, { status: "error", message: "Failed to load cameras" }]);
            }
        }

        load();
    }, [setSystemLogs]); // <-- IMPORTANT: kosong
    const cameraValueWatch = useWatch({ control: form.control, name: "camera" });
    const { data: cameras, isLoading } = useCameras();
    const onSubmit = (data: { camera: string }) => {
        if (data.camera.startsWith("webcam")) {
            const found = webcamList.find(w => w.deviceId === data.camera.split(":")[1]);
            if (!found) return setSystemLogs(prev => [...prev, { status: "error", message: "Camera not found" }]);
            setCamera({
                id: found.deviceId,
                url: `webcam:${found.deviceId}`,
                name: found.label,
            });
        } else {
            // ip cam
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end space-x-2">
                <Controller
                    name="camera"
                    control={form.control}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <FormLabel>
                                <Camera />
                            </FormLabel>
                            <Select
                                disabled={isLoading}
                                onValueChange={value => {
                                    field.onChange(value);
                                }}
                                defaultValue={field.value}
                            >
                                <SelectTrigger disabled={isLoading || recordingStatus !== "idle"} className="w-45">
                                    <SelectValue placeholder="Select a camera" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectLabel>Webcam</SelectLabel>
                                        {webcamList.map(webcam => (
                                            <SelectItem key={webcam.deviceId} value={`webcam:${webcam.deviceId}`}>
                                                {webcam.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    {cameras && cameras.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel>IP Cameras</SelectLabel>
                                            {cameras?.map(camera => (
                                                <SelectItem key={camera.id} value={camera.url}>
                                                    {camera.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />

                <ButtonWithIcon
                    type="submit"
                    disabled={camera.url === cameraValueWatch || recordingStatus !== "idle"}
                    startIcon={<CirclePlay />}
                    className={`${
                        ""
                        // createUserMutation.isPending || !form.formState.isValid
                        //     ? "cursor-not-allowed pointer-events-none"
                        //     : ""
                    }`}
                    // disabled={
                    //     createUserMutation.isPending || !form.formState.isValid
                    // }
                >
                    {/* {createUserMutation.isPending ? "Adding..." : "Add User"} */}
                    Start Stream
                </ButtonWithIcon>
            </form>
        </Form>
    );
}
