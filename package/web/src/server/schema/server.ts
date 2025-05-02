import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  appRouter: t.router({}),
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
    verify: publicProcedure.input(z.object({
      key: z.string(),
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
      imap_secure: z.boolean(),
      smtp_host: z.string(),
      smtp_port: z.number(),
      smtp_secure: z.boolean(),
    })).output(z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({
          id: z.string(),
        }),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ])).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMailAccounts: publicProcedure.output(z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        mailServer: z.object({
          id: z.string(),
          imapAddress: z.string(),
          imapPort: z.string(),
          imapSecure: z.boolean(),
          smtpAddress: z.string(),
          smtpPort: z.string(),
          smtpSecure: z.boolean(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    resetPassword: publicProcedure.input(z.object({
      email: z.string(),
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
    finishResetPassword: publicProcedure.input(z.object({
      code: z.string(),
      password: z.string(),
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
    userInfo: publicProcedure.output(z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ])).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMailAccount: publicProcedure.input(z.object({
      name: z.string(),
      accountId: z.string(),
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
    changePassword: publicProcedure.input(z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
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
    ])).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateAccount: publicProcedure.input(z.object({
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
    ])).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  mailRouter: t.router({
    getMail: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      page: z.number().optional().default(1),
    })).output(z.object({
      data: z.array(
        z.object({
          id: z.string(),
          subject: z.string(),
          sender: z.object({
            name: z.string(),
            email: z.string(),
            internal: z.optional(
              z.object({
                name: z.string(),
              }),
            ),
          }),
          body: z.string(),
          flags: z.array(z.string()),
          date: z.date(),
          headers: z.record(z.string(), z.any()),
          files: z.array(
            z.object({
              name: z.string(),
            }),
          ),
        }),
      ),
      meta: z.object({
        page: z.number(),
        total: z.number(),
        totalPages: z.number(),
        perPage: z.number(),
      }),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMailMessage: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
    })).output(z.object({
      id: z.string(),
      subject: z.string(),
      sender: z.object({
        name: z.string(),
        email: z.string(),
        internal: z.optional(
          z.object({
            name: z.string(),
          }),
        ),
      }),
      flags: z.array(z.string()),
      body: z.string(),
      date: z.date(),
      headers: z.record(z.string(), z.any()),
      preview: z.string(),
      files: z.array(
        z.object({
          name: z.string(),
          content: z.string(),
          type: z.string(),
          id: z.string(),
        }),
      ),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getRawMailMessage: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addMailMessageFlag: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      flag: z.string(),
    })).output(z.object({
      id: z.string(),
      flag: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removeMailMessageFlag: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      flag: z.string(),
    })).output(z.object({
      id: z.string(),
      flag: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    moveMailMessage: publicProcedure.input(z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      destination: z.string(),
    })).output(z.object({
      id: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    sendMailMessage: publicProcedure.input(z.object({
      accountId: z.string(),
      data: z.object({
        to: z.string(),
        cc: z.string().optional(),
        bcc: z.string().optional(),
        subject: z.string(),
        body: z.string(),
        attachments: z.array(
          z.object({
            name: z.string(),
            content: z.string(),
          }),
        ),
        headers: z.record(z.string(), z.any()),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMailboxes: publicProcedure.input(z.object({
      accountId: z.string(),
    })).output(z.array(
      z.object({
        name: z.string(),
        flags: z.array(z.string()),
      }),
    )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  adminRouter: t.router({
    isAuthorized: publicProcedure.output(z.object({
      authorized: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    listUsers: publicProcedure.output(z.object({
      users: z.array(
        z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
          createdAt: z.date(),
        }),
      ),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getStats: publicProcedure.output(z.object({
      users: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

