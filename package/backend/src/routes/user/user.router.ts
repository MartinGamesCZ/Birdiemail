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

// Router for handling user-related functionality
@Router()
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  // Route to check if the user is logged in
  // Uses authentication middleware
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      loggedIn: z.boolean(),
    }),
  })
  async isLoggedIn(@Ctx() context: any) {
    // Check if the user is authenticated
    if (context.authorized) return { loggedIn: true };

    // If not authenticated, return false
    return { loggedIn: false };
  }

  // Route to sign up a new user
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
    // Use the user service to handle the signup process
    return await this.userService.signup(data.email, data.password, data.name);
  }

  // Route to verify the user's email
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
    // Use the user service to handle the email verification process
    return await this.userService.verify(data.key);
  }

  // Route to sign in an existing user
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
    // Use the user service to handle the sign-in process
    return await this.userService.signin(data.email, data.password);
  }

  // Route to add a new mail account for the user
  // Uses authentication middleware
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
        data: z.object({
          id: z.string(),
        }),
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
    // Check if the user is authenticated
    if (!context.authorized) return ErrorResponse('Unauthorized');

    // Use the user service to handle the addition of the mail account
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

  // Route to get all mail accounts for the user
  // Uses authentication middleware
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
    // Return an error if the user is not authenticated
    if (!context.authorized) return ErrorResponse('Unauthorized');

    // Use the user service to get the mail accounts for the authenticated user
    return await this.userService.getMailAccounts(context.user);
  }

  // Route to request a password reset for the user
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
    // Use the user service to handle the password reset process
    return await this.userService.resetPassword(data.email);
  }

  // Route to finish the password reset process
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
    // Use the user service to handle the finalization of the password reset
    return await this.userService.finishResetPassword(data.code, data.password);
  }

  // Route to get the user's information
  // Uses authentication middleware
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
    // Check if the user is authenticated
    if (!context.authorized) return ErrorResponse('Unauthorized');

    // Use the user service to get the user's information
    return await this.userService.userInfo(context.user);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      name: z.string(),
      accountId: z.string(),
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
  async updateMailAccount(
    @Input()
    data: {
      name: string;
      accountId: string;
    },
    @Ctx() context: any,
  ) {
    // Check if the user is authenticated
    if (!context.authorized) return ErrorResponse('Unauthorized');

    // Use the user service to update the mail account name
    return await this.userService.updateMailAccount(
      context.user,
      data.accountId,
      data.name,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
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
  async changePassword(
    @Input()
    data: {
      oldPassword: string;
      newPassword: string;
    },
    @Ctx() context: any,
  ) {
    // Check if the user is authenticated
    if (!context.authorized) return ErrorResponse('Unauthorized');

    // Use the user service to change the password for the mail account
    return await this.userService.changePassword(
      context.user,
      data.oldPassword,
      data.newPassword,
    );
  }
}
