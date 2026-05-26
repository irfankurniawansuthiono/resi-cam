import { useState, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type UseUploadImageProps = {
  pathName: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
};

export function useUploadImage({
  pathName,
  onSuccess,
  onError,
}: UseUploadImageProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pathname", pathName);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onSuccess?.(data.url);

        return data.url;
      } catch (err: any) {
        onError?.(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [pathName, onSuccess, onError],
  );

  return {
    uploadImage,
    isUploading,
  };
}
