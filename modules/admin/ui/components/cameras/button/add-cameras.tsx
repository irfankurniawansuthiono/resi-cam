"use client";
import { appToast } from "@/components/custom/app-toast";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { addCameraSchema, type AddCameraFormValues } from "@/lib/form-schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Plus, Webcam } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
export default function AddCameras() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm<AddCameraFormValues>({
        resolver: zodResolver(addCameraSchema),
        mode: "onSubmit",
        shouldFocusError: true,
        defaultValues: {
            name: "",
            url: "",
        },
    });
    const trpc = useTRPC();
    const createCameraMutation = useMutation(
        trpc.camera.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.camera.get.queryFilter());
                form.reset();
                setDialogOpen(false);
                setError(undefined);
                appToast.success("Camera created successfully!");
            },
            onError: err => {
                setError(err.message);
                console.debug(err);
                appToast.error(err.message);
            },
        }),
    );
    const onSubmit = async (data: AddCameraFormValues) => {
        setError(undefined);
        createCameraMutation.mutate({
            name: data.name,
            url: data.url,
        });
    };
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <ButtonWithIcon startIcon={<Plus />} variant="default">
                    Add New Camera
                </ButtonWithIcon>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Add New Camera</DialogTitle>
                            <DialogDescription>Fill in the details to add a new IP Camera.</DialogDescription>
                        </DialogHeader>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Name field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <Webcam className="inline" size={15} />
                                        Camera Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter camera name"
                                            {...field}
                                            disabled={createCameraMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* URL field */}
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <Link className="inline" size={15} />
                                        Camera URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter camera URL (RTSP/HTTP)"
                                            {...field}
                                            disabled={createCameraMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="select-none cursor-pointer">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <ButtonWithIcon
                                type="submit"
                                startIcon={createCameraMutation.isPending ? <Spinner /> : <Plus />}
                                className={`${
                                    createCameraMutation.isPending || !form.formState.isValid
                                        ? "cursor-not-allowed pointer-events-none"
                                        : ""
                                }`}
                                disabled={createCameraMutation.isPending || !form.formState.isValid}
                            >
                                {createCameraMutation.isPending ? "Adding..." : "Add Camera"}
                            </ButtonWithIcon>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
