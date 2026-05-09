import { createTRPCRouter, withRole } from "@/trpc/init";
import z from "zod";

const getDashboardSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
});

export const dashboardRouter = createTRPCRouter({
    get: withRole("admin")
        .input(getDashboardSchema)
        .query(async ({ ctx, input }) => {
            const { startDate, endDate } = input;

            const from = new Date(startDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(endDate);
            to.setHours(23, 59, 59, 999);

            const db = ctx.db;

            const allRecords = await db.record.findMany({
                where: {
                    createdAt: { gte: from, lte: to },
                },
                include: {
                    camera: { select: { id: true, name: true } },
                    webCameraSession: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
            });

            const statusCounts = {
                recording: 0,
                processing: 0,
                done: 0,
                failed: 0,
            };
            const sourceTypeCounts = {
                CAMERA: 0,
                WEBCAM: 0,
            };

            for (const r of allRecords) {
                statusCounts[r.status as keyof typeof statusCounts]++;
                sourceTypeCounts[r.sourceType as keyof typeof sourceTypeCounts]++;
            }

            const recentRecords = allRecords.slice(0, 10);

            return {
                statusCounts,
                sourceTypeCounts,
                total: allRecords.length,
                recentRecords,
            };
        }),
});
