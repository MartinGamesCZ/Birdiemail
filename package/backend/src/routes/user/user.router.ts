import { Headers, Inject } from '@nestjs/common';
import {
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import { z, ZodType } from 'zod';
import { UserService } from './user.service';
import { AuthMiddleware } from '../auth.middleware';
import { ErrorResponse } from 'src/utils/response';

@Router()
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      loggedIn: z.boolean(),
    }),
  })
  async isLoggedIn(@Ctx() context: any) {
    if (context.authorized) return { loggedIn: true };

    return { loggedIn: false };
  }

  @Mutation({
    input: z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    }),
    output: z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ]),
  })
  async signup(
    @Input() data: { email: string; password: string; name: string },
  ) {
    return await this.userService.signup(data.email, data.password, data.name);
  }

  @Mutation({
    input: z.object({
      key: z.string(),
    }),
    output: z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ]),
  })
  async verify(@Input() data: { key: string }) {
    return await this.userService.verify(data.key);
  }

  @Query({
    input: z.object({
      email: z.string(),
      password: z.string(),
    }),
    output: z.union([
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
    ]),
  })
  async signin(@Input() data: { email: string; password: string }) {
    return await this.userService.signin(data.email, data.password);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
      imap_host: z.string(),
      imap_port: z.number(),
      imap_secure: z.boolean(),
      smtp_host: z.string(),
      smtp_port: z.number(),
      smtp_secure: z.boolean(),
    }),
    output: z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ]),
  })
  async addMailAccount(
    @Input()
    data: {
      email: string;
      password: string;
      name: string;
      imap_host: string;
      imap_port: number;
      imap_secure: boolean;
      smtp_host: string;
      smtp_port: number;
      smtp_secure: boolean;
    },
    @Ctx() context: any,
  ) {
    if (!context.authorized) return ErrorResponse('Unauthorized');

    return await this.userService.addMailAccount(
      data.name,
      data.email,
      data.password,
      data.imap_host,
      data.imap_port,
      data.imap_secure,
      data.smtp_host,
      data.smtp_port,
      data.smtp_secure,
      context.user,
      context.encryptionKey,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.array(
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
    ),
  })
  async getMailAccounts(@Ctx() context: any) {
    if (!context.authorized) return ErrorResponse('Unauthorized');

    return await this.userService.getMailAccounts(context.user);
  }

  @Mutation({
    input: z.object({
      email: z.string(),
    }),
    output: z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ]),
  })
  async resetPassword(@Input() data: { email: string }) {
    return await this.userService.resetPassword(data.email);
  }

  @Mutation({
    input: z.object({
      code: z.string(),
      password: z.string(),
    }),
    output: z.union([
      z.object({
        status: z.literal('ok'),
        data: z.object({}),
      }),
      z.object({
        status: z.literal('error'),
        message: z.string(),
      }),
    ]),
  })
  async finishResetPassword(@Input() data: { code: string; password: string }) {
    return await this.userService.finishResetPassword(data.code, data.password);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.union([
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
    ]),
  })
  async userInfo(@Ctx() context: any) {
    if (!context.authorized) return ErrorResponse('Unauthorized');

    return await this.userService.userInfo(context.user);
  }
}
