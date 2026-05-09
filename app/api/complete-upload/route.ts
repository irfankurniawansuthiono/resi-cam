// app/api/complete-upload/route.ts

import { finalPath } from "@/app/config/config";
import { createLogs } from "@/lib/logs";
import prisma from "@/lib/prisma";
import { exec } from "child_process";
import fs from "fs";
import { mkdir, rm } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const {
            sessionId,
            barcode,
        }: {
            sessionId: string;
            barcode: string;
        } = await req.json();

        if (!sessionId || !barcode) {
            return NextResponse.json({ error: "Missing sessionId or barcode" }, { status: 400 });
        }

        const baseDir = path.join(process.cwd(), finalPath, "chunks", sessionId);

        // ✅ Folder tidak ada = rekaman terlalu pendek, belum sempat upload chunk
        if (!fs.existsSync(baseDir)) {
            return NextResponse.json({ error: "invalid_video_length" }, { status: 422 });
        }

        const files = fs
            .readdirSync(baseDir)
            .filter(f => f.endsWith(".webm"))
            .sort((a, b) => Number(a.split(".")[0]) - Number(b.split(".")[0]));

        if (files.length < 5) {
            try {
                await prisma.record.delete({
                    where: {
                        barcodeResi: barcode,
                    },
                });
                await rm(baseDir, { recursive: true, force: true });
            } catch (err) {
                console.error(err);
            }

            return NextResponse.json({ error: "invalid_video_length" }, { status: 422 });
        }

        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const finalDir = path.join(process.cwd(), finalPath, year, month, day);
        await mkdir(finalDir, { recursive: true });

        const outputPath = path.join(finalDir, `${barcode}.mp4`);

        // ✅ Step 1: Baca semua chunk ke memory, lalu release file handle
        const allBuffers: Buffer[] = files.map(f => fs.readFileSync(path.join(baseDir, f)));

        // ✅ Step 2: Tulis merged.webm — semua file handles sudah bebas
        const mergedWebm = path.join(baseDir, "merged.webm");
        if (files.length === 1) {
            // ✅ Single chunk — langsung copy, jangan di-concat
            fs.copyFileSync(path.join(baseDir, files[0]), mergedWebm);
        } else {
            // ✅ Multiple chunks — binary merge
            fs.writeFileSync(mergedWebm, Buffer.concat(allBuffers));
        }

        // ✅ Step 3: FFmpeg convert
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${mergedWebm}" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`,
                (err, _stdout, stderr) => {
                    if (err) {
                        console.error("FFmpeg error:", stderr);
                        reject(err);
                        createLogs({
                            message: `Failed to merge chunks: ${sessionId} for barcode ${barcode}`,
                            status: "failed",
                            chunkId: sessionId,
                        });
                    } else {
                        resolve(true);
                    }
                },
            );
        });

        // ✅ Step 4: Delete chunks folder
        try {
            console.log("Video merged:", outputPath);
            await rm(baseDir, { recursive: true, force: true });
            console.log("Chunks cleaned up:", baseDir);
        } catch (rmErr) {
            console.error("Cleanup failed (non-critical):", rmErr);
            createLogs({
                message: `Failed to cleanup chunks: ${sessionId} for barcode ${barcode}`,
                status: "failed",
                chunkId: sessionId,
            });
        }

        const outputVideoSrc = `/uploads/${year}/${month}/${day}/${barcode}.mp4`;
        // ✅ Step 5: Update DB
        try {
            await prisma.record.update({
                where: {
                    barcodeResi: barcode,
                },
                data: {
                    status: "done",
                    videoPath: outputVideoSrc,
                },
            });
        } catch (error) {
            console.error("DB update failed (non-critical):", error);
            createLogs({
                message: `Failed to update DB: ${sessionId} for barcode ${barcode}`,
                status: "failed",
                chunkId: sessionId,
            });
        }

        return NextResponse.json({
            success: true,
            output: outputVideoSrc,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Merge failed" }, { status: 500 });
    }
}
