import { DeleteConfirmationDialog } from "@/components/custom/alert-dialog-custom";
import { appToast } from "@/components/custom/app-toast";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useState } from "react";

export default function DeleteUser({
  id,
}: {
  id: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const deleteUserMutation = useMutation(trpc.user.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.user.get.queryFilter());
      setOpen(false);
       appToast.success("User deleted successfully!");
    },
    onError: (err) => {
      console.error(err);
      appToast.error("Something went wrong!");
    },
  }));

  return (
    <DeleteConfirmationDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete User"
      description="Are you sure you want to delete this user?"
      onConfirm={() => deleteUserMutation.mutate({ id })}
      isDeleting={deleteUserMutation.isPending}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash color="red" />
        </Button>
      </AlertDialogTrigger>
    </DeleteConfirmationDialog>
  );
}
