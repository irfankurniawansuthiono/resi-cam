"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useCameras = () => {
    const trpc = useTRPC();
    return useQuery(
        trpc.camera.getAll.queryOptions(undefined, {
            staleTime: Infinity,
        }),
    );
};
