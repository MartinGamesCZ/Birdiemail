import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { Inject, Injectable, ConsoleLogger } from '@nestjs/common';
import { UserService } from './user/user.service';

// Middleware for handling user authentication
@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async use({ next, ctx }: MiddlewareOptions) {
    // Extract the headers from the request context
    const headers = (ctx as any).headers;

    // Check if there is an authorization header
    if (!headers['authorization'])
      // If no authorization header, set authorized to false and proceed
      return await next({
        ctx: {
          ...ctx,
          authorized: false,
        },
      });

    // Get user by the token from the user service
    const user = await this.userService.getUserByToken(
      headers['authorization'],
    );

    // Set authorization status and proceed if user is not found
    if (!user) return await next({ ctx: { ...ctx, authorized: false } });

    // Proceed with the user data and encryption key in the context
    return await next({
      ctx: {
        ...ctx,
        // Get the encryption key from the headers
        encryptionKey: (ctx as any).headers['x-birdiemail-encryption-key'],
        authorized: true,
        user: user,
      },
    });
  }
}
