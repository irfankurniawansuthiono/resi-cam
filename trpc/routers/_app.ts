import { createTRPCRouter } from "@/trpc/init";
import { cameraRouter } from "./camera";
import { dashboardRouter } from "./dashboard";
import { logsRouter } from "./logs";
import { recordingRouter } from "./recording";
import { userRouter } from "./user";
import { webCameraSessionRouter } from "./webCameraSession";
export const appRouter = createTRPCRouter({
    user: userRouter,
    camera: cameraRouter,
    record: recordingRouter,
    wcs: webCameraSessionRouter,
    dashboard: dashboardRouter,
    logs: logsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
