import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { projectRouter } from "@/server/api/routers/project";
import { teamRouter } from "@/server/api/routers/team";
import { taskRouter } from "@/server/api/routers/task";
import { commentRouter } from "@/server/api/routers/comment";
import { tagRouter } from "@/server/api/routers/tag";
import { userRouter } from "@/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  project: projectRouter,
  team: teamRouter,
  task: taskRouter,
  comment: commentRouter,
  tag: tagRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
