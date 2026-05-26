import { finalPath } from "@/app/config/config";
import { getContentType } from "@/utils/getContentType";
import { open, stat } from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: Promise<{ pathName: string[] }> }) {
    const { pathName } = await params;
    try {
        const baseDir = path.join(finalPath);
        const filePath = path.join(baseDir, ...pathName);

        if (!filePath.startsWith(baseDir)) {
            return new Response("Forbidden", { status: 403 });
        }

        const fileStat = await stat(filePath);
        const fileSize = fileStat.size;
        const contentType = getContentType(filePath);

        const rangeHeader = req.headers.get("range");

        if (rangeHeader) {
            const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
            const start = parseInt(startStr, 10);
            const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const fd = await open(filePath, "r");
            const buffer = Buffer.allocUnsafe(chunkSize);
            await fd.read(buffer, 0, chunkSize, start);
            await fd.close();

            return new Response(buffer, {
                status: 206,
                headers: {
                    "Content-Type": contentType,
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": String(chunkSize),
                },
            });
        }

        // No range header — return full file
        const fd = await open(filePath, "r");
        const buffer = Buffer.allocUnsafe(fileSize);
        await fd.read(buffer, 0, fileSize, 0);
        await fd.close();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Accept-Ranges": "bytes",
                "Content-Length": String(fileSize),
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: unknown) {
        console.error((error as Error).message);
        return new Response("File not found", { status: 404 });
    }
}
