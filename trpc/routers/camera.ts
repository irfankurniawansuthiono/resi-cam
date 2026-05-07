import useGetUniquePrismaField from "@/hooks/get-unique-prisma-field";
import { addCameraSchema, editCameraSchema } from "@/lib/form-schema";
import { deleteCameraSchema, getCameraSchema } from "@/lib/query-schema/camera-schema-api";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const cameraRouter = createTRPCRouter({
    delete: withRole("admin")
        .input(deleteCameraSchema)
        .mutation(async ({ ctx, input }) => {
            const deletedCamera = await ctx.db.camera.delete({
                where: {
                    id: input.id,
                },
            });
            return deletedCamera;
        }),
    create: withRole("admin")
        .input(addCameraSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const newCamera = await ctx.db.camera.create({
                    data: {
                        name: input.name,
                        url: input.url,
                        user: {
                            connect: {
                                id: ctx.session.user.id,
                            },
                        },
                    },
                });
                return newCamera;
            } catch (error: any) {
                if (error.code === "P2002") {
                    const field = useGetUniquePrismaField({ text: error.message });
                    if (field === "url") {
                        throw new Error("Camera with this url already exists");
                    }
                    if (field === "name") {
                        throw new Error("Camera with this name already exists");
                    }
                    throw new Error("Something went wrong");
                }
                throw new Error("Something went wrong");
            }
        }),
    getAll: withRole("admin").query(async ({ ctx }) => {
        const cameras = await ctx.db.camera.findMany({
            select: {
                id: true,
                name: true,
                url: true,
            },
        });
        return cameras;
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
            const cameras = await ctx.db.camera.findMany({
                skip,
                take: limit,
                where: {
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
            const hasNextPage = skip + cameras.length < cameraTotal;
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

            return { cameras, meta };
        }),
    edit: withRole("admin")
        .input(editCameraSchema)
        .mutation(async ({ input, ctx }) => {
            const data = await ctx.db.camera.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    url: input.url,
                },
            });
            return data;
        }),
});
