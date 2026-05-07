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
import { editCameraSchema, type EditCameraFormValues } from "@/lib/form-schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Pencil, Webcam } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
export default function EditCamera({
    data,
}: {
    data: {
        id: string;
        url: string;
        name: string;
    };
}) {
    const [error, setError] = useState<string | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm<EditCameraFormValues>({
        resolver: zodResolver(editCameraSchema),
        mode: "onSubmit",
        shouldFocusError: true,
        defaultValues: {
            id: data.id,
            name: data.name,
            url: data.url,
        },
    });
    const trpc = useTRPC();
    const editCameraMutation = useMutation(
        trpc.camera.edit.mutationOptions({
            onSuccess: data => {
                queryClient.invalidateQueries(trpc.camera.get.queryFilter());
                form.reset({
                    name: data.name,
                    url: data.url,
                    id: data.id,
                });
                setDialogOpen(false);
                setError(undefined);
                appToast.success("Camera added successfully!");
            },
            onError: err => {
                setError(err.message);
                console.debug(err);
                appToast.error("Something went wrong!");
            },
        }),
    );
    const onSubmit = async (data: EditCameraFormValues) => {
        setError(undefined);
        editCameraMutation.mutate({
            name: data.name,
            url: data.url,
            id: data.id,
        });
    };
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Pencil size={15} color="orange" />
                </Button>
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
                                            disabled={editCameraMutation.isPending}
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
                                            disabled={editCameraMutation.isPending}
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
                                startIcon={editCameraMutation.isPending ? <Spinner /> : <Pencil />}
                                className={`${
                                    editCameraMutation.isPending || !form.formState.isValid
                                        ? "cursor-not-allowed pointer-events-none"
                                        : ""
                                }`}
                                disabled={editCameraMutation.isPending || !form.formState.isValid}
                            >
                                {editCameraMutation.isPending ? "Editing..." : "Edit Camera"}
                            </ButtonWithIcon>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
