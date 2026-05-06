import { createTRPCRouter } from "@/trpc/init";

import { cameraRouter } from "./camera";
import { userRouter } from "./user";
export const appRouter = createTRPCRouter({
    user: userRouter,
    camera: cameraRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
