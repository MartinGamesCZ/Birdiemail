import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  appRouter: t.router({
    hello: publicProcedure.output(z.object({
      hello: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  userRouter: t.router({
    isLoggedIn: publicProcedure.output(z.object({
      loggedIn: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  mailRouter: t.router({
    getMail: publicProcedure.output(z.array(
      z.object({
        id: z.string(),
        subject: z.string(),
        sender: z.object({
          name: z.string(),
          email: z.string(),
        }),
        body: z.string(),
        date: z.date(),
      }),
    )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  })
});
export type AppRouter = typeof appRouter;

