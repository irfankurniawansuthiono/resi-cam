// app/api/upload-chunk/route.ts

import { createLogs } from "@/lib/logs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const index = formData.get("index") as string | null;
    const sessionId = formData.get("sessionId") as string | null;
    try {
        if (!file || !index || !sessionId) {
            return NextResponse.json({ error: "Missing file, index, or sessionId" }, { status: 400 });
        }

        // 📁 Folder tujuan
        const uploadDir = path.join(process.cwd(), "uploads", "chunks", sessionId);

        // Pastikan folder ada
        await mkdir(uploadDir, { recursive: true });

        // 📄 Nama file chunk
        const filePath = path.join(uploadDir, `${index}.webm`);

        // Convert ke buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Simpan ke disk
        await writeFile(filePath, buffer);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Upload chunk error:", error);
        createLogs({
            message: `Upload chunk error with session id ${sessionId} and chunk index ${index}`,
            status: "failed",
        });
        return NextResponse.json({ error: "Failed to upload chunk" }, { status: 500 });
    }
}
