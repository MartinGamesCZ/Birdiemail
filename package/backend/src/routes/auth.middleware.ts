import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { Inject, Injectable, ConsoleLogger } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async use({ next, ctx }: MiddlewareOptions) {
    const headers = (ctx as any).headers;

    if (!headers['authorization'])
      return await next({
        ctx: {
          ...ctx,
          authorized: false,
        },
      });

    const user = await this.userService.getUserByToken(
      headers['authorization'],
    );

    if (!user) return await next({ ctx: { ...ctx, authorized: false } });

    return await next({
      ctx: {
        ...ctx,
        encryptionKey: (ctx as any).headers['x-birdiemail-encryption-key'],
        authorized: true,
        user: user,
      },
    });
  }
}
