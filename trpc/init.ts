import { getSession } from "@/hooks/get-session";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleUser } from "@/modules/admin/ui/config/auth/role.user";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
export const createTRPCContext = cache(async (opts?: { req: Request }) => {
    /**
     * @see: https://trpc.io/docs/server/context
     */
    const ip = opts?.req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    return { userId: "user_123", ip };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const session = await getSession();

    if (!session) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Belum login" });
    }

    // ctx is already typed to include ip
    const ctxWithIp = ctx;

    return next({
        ctx: { ...ctxWithIp, session, ip: ctxWithIp.ip, db: prisma, auth },
    });
});

export const publicProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const ctxWithIp = ctx;

    return next({
        ctx: { ...ctxWithIp, db: prisma },
    });
});
export const withRole = (...roles: RoleUser[]) =>
    protectedProcedure.use(({ ctx, next }) => {
        if (!roles.includes(ctx.session.user?.role as RoleUser)) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }
        return next();
    });
