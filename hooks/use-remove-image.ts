import { useState, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type UseUploadImageProps = {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
};

export function useDeleteImage({ onSuccess, onError }: UseUploadImageProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteImage = useCallback(
    async (value: string) => {
      try {
        setIsDeleting(true);
        const res = await fetch("/api/upload/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: value }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onSuccess?.(data.success);

        return data.success;
      } catch (err: any) {
        onError?.(err);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [onSuccess, onError],
  );

  return {
    deleteImage,
    isDeleting,
  };
}
