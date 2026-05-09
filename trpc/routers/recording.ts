import { Prisma } from "@/app/generated/prisma";
import useGetUniquePrismaField from "@/hooks/get-unique-prisma-field";
import { addRecordSchema, barcodeSchema } from "@/lib/form-schema";
import { getRecordSchema } from "@/lib/query-schema/record-schema-api";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */
const recordSelect = Prisma.validator<Prisma.RecordDefaultArgs>()({
    select: {
        id: true,
        barcodeResi: true,
        videoPath: true,
        status: true,
        sourceType: true,
        recordedBy: {
            select: {
                name: true,
            },
        },
        createdAt: true,
        updatedAt: true,
        webCameraSession: {
            select: {
                name: true,
            },
        },
        camera: {
            select: {
                name: true,
            },
        },
    },
});

export type RecordListItem = Prisma.RecordGetPayload<typeof recordSelect>;
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
    get: withRole("admin", "user")
        .input(getRecordSchema)
        .query(async ({ ctx, input }) => {
            const currentPage = input.page || 1;
            const limit = input.limit || 10;
            const sortDirection = input.sortDirection || "desc";
            const sortBy = input.sortBy || "updatedAt";
            const search = input.search || "";
            const skip = (currentPage - 1) * limit;
            const packsTotal = await ctx.db.record.count({
                where: {
                    OR: [
                        {
                            barcodeResi: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
            const packs = await ctx.db.record.findMany({
                skip,
                take: limit,
                where: {
                    OR: [
                        {
                            barcodeResi: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                select: recordSelect.select,
                orderBy: {
                    [sortBy]: sortDirection,
                },
            });
            const hasNextPage = skip + packs.length < packsTotal;
            const hasPreviousPage = skip > 0;
            const totalPages = Math.ceil(packsTotal / limit);
            const meta = {
                total: packsTotal,
                currentPage,
                limit,
                hasNextPage,
                hasPreviousPage,
                totalPages,
                nextPage: hasNextPage ? currentPage + 1 : null,
                previousPage: hasPreviousPage ? currentPage - 1 : null,
            };

            return { packs, meta };
        }),
});
