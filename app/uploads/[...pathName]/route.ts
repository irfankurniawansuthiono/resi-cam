import { finalPath } from "@/app/config/config";
import { getContentType } from "@/utils/getContentType";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: Promise<{ pathName: string }> }) {
    const { pathName } = await params;

    try {
        const baseDir = path.join(process.cwd(), finalPath);
        const filePath = path.join(baseDir, ...pathName);

        if (!filePath.startsWith(baseDir)) {
            return new Response("Forbidden", { status: 403 });
        }

        const file = await readFile(filePath);

        return new Response(file, {
            headers: {
                "Content-Type": getContentType(filePath),
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: unknown) {
        console.error((error as Error).message);
        return new Response("File not found", { status: 404 });
    }
}
