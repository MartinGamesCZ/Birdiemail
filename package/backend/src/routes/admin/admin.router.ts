import { Ctx, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AdminService } from './admin.service';
import { AuthMiddleware } from '../auth.middleware';
import { z } from 'zod';
import { hasPermission } from 'src/providers/user/permission';
import { Permission } from 'src/types/user/permission';

@Router()
export class AdminRouter {
  constructor(private readonly adminService: AdminService) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      authorized: z.boolean(),
    }),
  })
  async isAuthorized(@Ctx() context: any) {
    if (!context.authorized) return { authorized: false };

    return {
      authorized: await hasPermission(
        context.user.id,
        Permission.InternalAdminView,
      ),
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      users: z.array(
        z.object({
          id: z.string(),
          email: z.string(),
          name: z.string(),
          createdAt: z.date(),
        }),
      ),
    }),
  })
  async listUsers(@Ctx() context: any) {
    if (!(await this.isAuthorized(context)).authorized) return { users: [] };

    const users = await this.adminService.listUsers();

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })),
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      users: z.number(),
    }),
  })
  async getStats(@Ctx() context: any) {
    if (!(await this.isAuthorized(context)).authorized) return { users: 0 };

    const stats = await this.adminService.getStats();

    return {
      users: stats.users,
    };
  }
}
