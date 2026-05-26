"use client";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { LockKeyhole, UserLock } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { PasswordInput } from "@/components/custom/password-input";
import { Spinner } from "@/components/ui/spinner";
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/form-schema";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { appToast } from "@/components/custom/app-toast";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ResetPasswordUser({ id }: { id: string }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
const revokeUserSessions = useMutation(
  trpc.user.revokeSession.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.user.get.queryFilter());
      appToast.success("User sessions revoked successfully!");
    },
    onError: (error) => {
      appToast.error("Something went wrong!");
      console.error(error);
    }
  }
)
)
const resetPasswordMutation = useMutation(
      trpc.user.resetPassword.mutationOptions({
       onSuccess: () => {
        setDialogOpen(false);
        setError(undefined);
        queryClient.invalidateQueries(trpc.user.get.queryFilter());
        form.reset();
        appToast.success("Password reset successfully!");
          revokeUserSessions.mutate({id});
       },
       onError: (error) => {
        setError(error.message);
        appToast.error("Something went wrong!");
       }
      })
    )
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(undefined);
    resetPasswordMutation.mutate({
      id,
      ...data
    });

  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserLock size={15} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>ID: {id}</DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Password field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LockKeyhole className="inline" size={15} />
                    New Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      placeholder="Enter your new password"
                      required
                      disabled={resetPasswordMutation.isPending}
                      {...{ showRules: true, showStrength: true }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LockKeyhole className="inline" size={15} />
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Confirm your new password"
                      required
                      disabled={resetPasswordMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="select-none cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>
              <ButtonWithIcon
                type="submit"
                startIcon={
                  resetPasswordMutation.isPending ? <Spinner /> : <UserLock />
                }
                className={`${
                  resetPasswordMutation.isPending || !form.formState.isValid
                    ? "cursor-not-allowed pointer-events-none"
                    : ""
                }`}
                disabled={
                  resetPasswordMutation.isPending || !form.formState.isValid
                }
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </ButtonWithIcon>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
