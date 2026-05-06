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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { addCameraSchema, type AddCameraFormValues } from "@/lib/form-schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Info, Link, UserPlus, Webcam } from "lucide-react";
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
            type: "IPCAM",
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
                appToast.success("User created successfully!");
            },
            onError: err => {
                setError(err.message);
                console.debug(err);
                appToast.error("Something went wrong!");
            },
        }),
    );
    const onSubmit = async (data: AddCameraFormValues) => {
        setError(undefined);
        createCameraMutation.mutate({
            name: data.name,
            url: data.url,
            type: "IPCAM",
        });
    };
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <ButtonWithIcon startIcon={<UserPlus />} variant="default">
                    Add New User
                </ButtonWithIcon>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
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
                        {/* type field */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="w-full flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Camera className="inline" size={15} />
                                            Camera Type
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant={"link"} size={"sm"}>
                                                    <Info size={15} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Default is set to IPCAM, WEBCAM will be automatically detected</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select camera type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IPCAM">IPCAM</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                startIcon={createCameraMutation.isPending ? <Spinner /> : <UserPlus />}
                                className={`${
                                    createCameraMutation.isPending || !form.formState.isValid
                                        ? "cursor-not-allowed pointer-events-none"
                                        : ""
                                }`}
                                disabled={createCameraMutation.isPending || !form.formState.isValid}
                            >
                                {createCameraMutation.isPending ? "Adding..." : "Add User"}
                            </ButtonWithIcon>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
