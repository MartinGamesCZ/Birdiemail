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
      smtp_host: z.string(),
      smtp_port: z.number(),
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
      smtp_host: string;
      smtp_port: number;
    },
    @Ctx() context: any,
  ) {
    if (!context.authorized) return ErrorResponse('Unauthorized');

    console.log(context.headers);

    return await this.userService.addMailAccount(
      data.name,
      data.email,
      data.password,
      data.imap_host,
      data.imap_port,
      data.smtp_host,
      data.smtp_port,
      context.user,
      context.headers['x-birdiemail-encryption-key'],
    );
  }
}
