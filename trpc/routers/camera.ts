import { addCameraSchema } from "@/lib/form-schema";
import { getCameraSchema } from "@/lib/query-schema/camera-schema-api";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const cameraRouter = createTRPCRouter({
    create: withRole("admin")
        .input(addCameraSchema)
        .mutation(async ({ input, ctx }) => {
            const newCamera = await ctx.db.camera.create({
                data: {
                    name: input.name,
                    url: input.url,
                    type: input.type,
                    user: {
                        connect: {
                            id: ctx.session.user.id,
                        },
                    },
                },
            });
            return newCamera;
        }),
    get: withRole("admin")
        .input(getCameraSchema)
        .query(async ({ ctx, input }) => {
            const currentPage = input.page || 1;
            const limit = input.limit || 10;
            const sortDirection = input.sortDirection || "desc";
            const sortBy = input.sortBy || "updatedAt";
            const search = input.search || "";
            const skip = (currentPage - 1) * limit;
            const cameraTotal = await ctx.db.camera.count({
                where: {
                    NOT: {
                        id: ctx.session.user.id,
                    },
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            url: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
            const users = await ctx.db.camera.findMany({
                skip,
                take: limit,
                where: {
                    NOT: {
                        id: ctx.session.user.id,
                    },
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            url: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                orderBy: {
                    [sortBy]: sortDirection,
                },
            });
            const hasNextPage = skip + users.length < cameraTotal;
            const hasPreviousPage = skip > 0;
            const totalPages = Math.ceil(cameraTotal / limit);
            const meta = {
                total: cameraTotal,
                currentPage,
                limit,
                hasNextPage,
                hasPreviousPage,
                totalPages,
                nextPage: hasNextPage ? currentPage + 1 : null,
                previousPage: hasPreviousPage ? currentPage - 1 : null,
            };

            return { users, meta };
        }),
});
