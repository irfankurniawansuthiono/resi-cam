import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isDeleting: boolean;
    confirmationKeyword?: string;
    confirmationText?: string;
    children?: React.ReactNode;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    isDeleting,
    confirmationKeyword = "DELETE",
    confirmationText,
    children,
}: DeleteConfirmationDialogProps) {
    const [confirmationInput, setConfirmationInput] = useState("");

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            setConfirmationInput("");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            {children}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash size={24} color="red" /> {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                    <div className="mt-4">
                        <p className="mb-2 text-sm text-muted-foreground">
                            Type <span className="font-bold text-destructive">{confirmationKeyword}</span> to confirm.
                        </p>
                        <Input
                            autoFocus
                            value={confirmationInput}
                            onChange={e => setConfirmationInput(e.target.value)}
                            placeholder={confirmationKeyword}
                        />
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => onConfirm(e)}
                        disabled={isDeleting || confirmationInput !== confirmationKeyword}
                        className="bg-destructive! text-destructive-foreground! hover:bg-destructive/90 hover:cursor-pointer"
                    >
                        {isDeleting ? (
                            <>
                                <Spinner />
                                {confirmationText ? confirmationText : "Deleting..."}
                            </>
                        ) : (
                            confirmationText || "Yes, Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
