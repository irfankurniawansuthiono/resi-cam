import { addWebCameraSchema } from "@/lib/form-schema";
import { createTRPCRouter, withRole } from "@/trpc/init";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const webCameraSessionRouter = createTRPCRouter({
    create: withRole("admin", "user")
        .input(addWebCameraSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const newRecord = await ctx.db.webCameraSession.create({
                    data: {
                        deviceId: input.id,
                        name: input.name,
                        url: input.url,
                        userId: ctx.session.user.id,
                    },
                });

                return newRecord;
            } catch (error: any) {
                console.error(error);
                throw new Error("Something went wrong");
            }
        }),
});
