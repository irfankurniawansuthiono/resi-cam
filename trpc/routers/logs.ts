import { getLogsSchema } from "@/lib/query-schema/logs-schema-api";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const logsRouter = createTRPCRouter({
    get: withRole("admin")
        .input(getLogsSchema)
        .query(async ({ ctx, input }) => {
            const currentPage = input.page || 1;
            const limit = input.limit || 10;
            const sortDirection = input.sortDirection || "desc";
            const sortBy = input.sortBy || "updatedAt";
            const search = input.search || "";
            const skip = (currentPage - 1) * limit;
            const logsTotal = await ctx.db.logs.count({
                where: {
                    NOT: {
                        id: ctx.session.user.id,
                    },
                    OR: [
                        {
                            message: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
            const logs = await ctx.db.logs.findMany({
                skip,
                take: limit,
                where: {
                    OR: [
                        {
                            message: {
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
            const hasNextPage = skip + logs.length < logsTotal;
            const hasPreviousPage = skip > 0;
            const totalPages = Math.ceil(logsTotal / limit);
            const meta = {
                total: logsTotal,
                currentPage,
                limit,
                hasNextPage,
                hasPreviousPage,
                totalPages,
                nextPage: hasNextPage ? currentPage + 1 : null,
                previousPage: hasPreviousPage ? currentPage - 1 : null,
            };

            return { logs, meta };
        }),
});
