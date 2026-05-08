import useGetUniquePrismaField from "@/hooks/get-unique-prisma-field";
import { addRecordSchema, barcodeSchema } from "@/lib/form-schema";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const recordingRouter = createTRPCRouter({
    check: withRole("admin", "user")
        .input(barcodeSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const data = await ctx.db.record.findFirst({
                    where: {
                        barcodeResi: input.barcode,
                    },
                });
                if (data) {
                    throw new Error("Barcode Already Exists");
                }
                return true;
            } catch (error) {
                console.error(error);
                throw new Error("Barcode Already Exists");
            }
        }),
    create: withRole("admin", "user")
        .input(addRecordSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const newRecord = await ctx.db.record.create({
                    data: {
                        barcodeResi: input.barcodeResi,
                        videoPath: input.videoPath,
                        status: input.status,
                        sourceType: input.sourceType,
                        cameraId: input.cameraId,
                        webCameraSessionId: input.webCameraSessionId || null,
                        recordedById: ctx.session.user.id,
                    },
                });

                return newRecord;
            } catch (error: any) {
                if (error.code === "P2002") {
                    const field = useGetUniquePrismaField({ text: error.message });

                    if (field === "barcodeResi") {
                        throw new Error("Barcode Already Exists");
                    }

                    throw new Error("Unique constraint failed");
                }

                throw new Error("Something went wrong");
            }
        }),
});
