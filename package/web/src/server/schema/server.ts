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
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    signup: publicProcedure.input(z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    })).output(z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ])).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    signin: publicProcedure.input(z.object({
      email: z.string(),
      password: z.string(),
    })).output(z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({
          token: z.string(),
          encryptionKey: z.string(),
        }),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ])).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addMailAccount: publicProcedure.input(z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
      imap_host: z.string(),
      imap_port: z.number(),
      smtp_host: z.string(),
      smtp_port: z.number(),
    })).output(z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ])).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
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

