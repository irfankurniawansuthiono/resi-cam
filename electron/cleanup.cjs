const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("../app/generated/prisma");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "../prisma/dev.db");
const uploadsPath = path.join(__dirname, "../uploads");

const adapter = new PrismaLibSql({ url: `file:${dbPath.replace(/\\/g, "/")}` });
const prisma = new PrismaClient({ adapter });

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

function deleteEmptyDirs(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath);

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        if (fs.statSync(fullPath).isDirectory()) {
            deleteEmptyDirs(fullPath); // recursive ke dalam dulu
        }
    }

    // Setelah isi diperiksa, cek lagi apakah folder sekarang kosong
    const remaining = fs.readdirSync(dirPath);
    if (remaining.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`Deleted empty dir: ${dirPath}`);
    }
}

async function cleanup() {
    // Hapus records lama + ambil videoPath sebelum dihapus
    const oldRecords = await prisma.record.findMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
        select: { videoPath: true },
    });

    // Hapus file video dari disk
    let deletedFiles = 0;
    for (const record of oldRecords) {
        if (record.videoPath) {
            const filePath = path.join(__dirname, "..", record.videoPath);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    deletedFiles++;
                }
            } catch (err) {
                console.error(`Failed to delete ${filePath}:`, err.message);
            }
        }
    }

    // Baru hapus dari database
    const deletedRecords = await prisma.record.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
    });

    const deletedSessions = await prisma.webCameraSession.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
    });

    const uploadsPath = path.join(__dirname, "../uploads");
    deleteEmptyDirs(uploadsPath);

    console.log(`Deleted ${deletedRecords.count} old records`);
    console.log(`Deleted ${deletedSessions.count} old sessions`);
    console.log(`Deleted ${deletedFiles} video files`);

    await prisma.$disconnect();
    console.log("Cleanup done!");
}

cleanup().catch(console.error);
