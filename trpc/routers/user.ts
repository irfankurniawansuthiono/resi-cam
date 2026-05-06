import { addUserSchema, resetPasswordAdminSchema } from "@/lib/form-schema";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    deleteUserSchema,
    editUserSchema,
    getUserSchema,
    revokeSessionUserSchema,
} from "@/lib/query-schema/user-schema-api";
import { headers } from "next/headers";

export const userRouter = createTRPCRouter({
    create: withRole("admin")
        .input(addUserSchema)
        .mutation(async ({ input, ctx }) => {
            const newUser = await ctx.auth.api.createUser({
                body: {
                    email: input.email,
                    password: input.password,
                    name: input.name,
                    role: input.role as any,
                },
            });
            return newUser;
        }),
    get: withRole("admin")
        .input(getUserSchema)
        .query(async ({ ctx, input }) => {
            const currentPage = input.page || 1;
            const limit = input.limit || 10;
            const rolesFilter = input.rolesFilter || [];
            const banned = input.bannedFilter;
            const verified = input.verifiedFilter;
            const sortDirection = input.sortDirection || "desc";
            const sortBy = input.sortBy || "updatedAt";
            const search = input.search || "";
            const skip = (currentPage - 1) * limit;
            const userTotal = await ctx.db.user.count({
                where: {
                    NOT: {
                        id: ctx.session.user.id,
                    },
                    role: rolesFilter.length > 0 ? { in: rolesFilter } : undefined,
                    banned:
                        banned === undefined
                            ? undefined
                            : {
                                  equals: banned,
                              },
                    emailVerified: verified === undefined ? undefined : { equals: verified },
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
            const users = await ctx.db.user.findMany({
                skip,
                take: limit,
                where: {
                    NOT: {
                        id: ctx.session.user.id,
                    },
                    role: rolesFilter.length > 0 ? { in: rolesFilter } : undefined,
                    banned: banned === undefined ? undefined : { equals: banned },
                    emailVerified:
                        verified === undefined
                            ? undefined
                            : {
                                  equals: verified,
                              },
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
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
            const hasNextPage = skip + users.length < userTotal;
            const hasPreviousPage = skip > 0;
            const totalPages = Math.ceil(userTotal / limit);
            const meta = {
                total: userTotal,
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
    delete: withRole("admin")
        .input(deleteUserSchema)
        .mutation(async ({ ctx, input }) => {
            const deletedUser = await ctx.auth.api.removeUser({
                body: {
                    userId: input.id,
                },
                headers: await headers(),
            });
            return deletedUser;
        }),
    resetPassword: withRole("admin")
        .input(resetPasswordAdminSchema)
        .mutation(async ({ ctx, input }) => {
            const { status } = await ctx.auth.api.setUserPassword({
                body: {
                    userId: input.id,
                    newPassword: input.password,
                },
                headers: await headers(),
            });

            return status;
        }),
    edit: withRole("admin")
        .input(editUserSchema)
        .mutation(async ({ input, ctx }) => {
            const data = await ctx.auth.api.adminUpdateUser({
                body: {
                    userId: input.id, // required
                    data: {
                        name: input.name,
                        email: input.email,
                        role: input.role as any,
                    },
                },
                headers: await headers(),
            });
            return data;
        }),
    revokeSession: withRole("admin")
        .input(revokeSessionUserSchema)
        .mutation(async ({ ctx, input }) => {
            const data = await ctx.auth.api.revokeUserSessions({
                body: {
                    userId: input.id, // required
                },
                headers: await headers(),
            });
            return data;
        }),
});
