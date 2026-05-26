"use client";
import { appToast } from "@/components/custom/app-toast";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { PasswordInput } from "@/components/custom/password-input";
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
import { AddUserFormValues, addUserSchema } from "@/lib/form-schema";
import { role, roleList } from "@/modules/admin/ui/config/auth/role.user";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, Mail, User, UserKey, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
export default function AddUser() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm<AddUserFormValues>({
        resolver: zodResolver(addUserSchema),
        mode: "onSubmit",
        shouldFocusError: true,
        defaultValues: {
            email: "",
            password: "",
            name: "",
            role: role.user,
        },
    });
    const trpc = useTRPC();
    const createUserMutation = useMutation(
        trpc.user.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.user.get.queryFilter());
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
    const onSubmit = async (data: AddUserFormValues) => {
        setError(undefined);
        createUserMutation.mutate(data);
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
                                        <User className="inline" size={15} />
                                        Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter full name"
                                            {...field}
                                            disabled={createUserMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <Mail className="inline" size={15} />
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email address"
                                            {...field}
                                            disabled={createUserMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* roles selection dropdown */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <UserKey className="inline" size={15} />
                                        Role
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={createUserMutation.isPending}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roleList.map(role => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Password field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <LockKeyhole className="inline" size={15} />
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Enter your password"
                                            required
                                            disabled={createUserMutation.isPending}
                                            {...{ showRules: true, showStrength: true }}
                                        />
                                    </FormControl>
                                    {/* <FormMessage /> */}
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
                                startIcon={createUserMutation.isPending ? <Spinner /> : <UserPlus />}
                                className={`${
                                    createUserMutation.isPending || !form.formState.isValid
                                        ? "cursor-not-allowed pointer-events-none"
                                        : ""
                                }`}
                                disabled={createUserMutation.isPending || !form.formState.isValid}
                            >
                                {createUserMutation.isPending ? "Adding..." : "Add User"}
                            </ButtonWithIcon>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
