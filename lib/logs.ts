import { prisma } from "./prisma";
export async function createLogs({
    message,
    status,
    chunkId,
}: {
    message: string;
    status: "done" | "failed";
    chunkId?: string;
}) {
    try {
        await prisma.logs.create({
            data: {
                message,
                status,
                chunkId,
            },
        });
    } catch (error) {
        console.error(error);
        throw new Error("Something went wrong");
    }
}
