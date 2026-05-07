"use client";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Form, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCameras } from "@/hooks/use-camera";
import { Camera, CirclePlay } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
export default function CameraSelect({
    setCamera,
    camera,
}: {
    setCamera: (camera: { id: string; url: string }) => void;
    camera: { id: string; url: string };
}) {
    const form = useForm({
        defaultValues: {
            camera: "",
        },
        mode: "onChange",
    });
    const cameraValueWatch = useWatch({ control: form.control, name: "camera" });
    const { data: cameras, isLoading } = useCameras();
    const onSubmit = (data: { camera: string }) => {
        if (data.camera === "webcam") {
            setCamera({ id: "webcam", url: "webcam" });
        } else {
            const found = cameras?.find(c => c.url === data.camera);
            setCamera({ id: found?.id ?? "", url: data.camera });
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
                                <SelectTrigger className="w-45">
                                    <SelectValue placeholder="Select a camera" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="webcam">Webcam</SelectItem>
                                    {cameras?.map(camera => (
                                        <SelectItem key={camera.id} value={camera.url}>
                                            {camera.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />

                <ButtonWithIcon
                    type="submit"
                    disabled={camera.url === cameraValueWatch}
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
