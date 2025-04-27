import { Ctx, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AdminService } from './admin.service';
import { AuthMiddleware } from '../auth.middleware';
import { z } from 'zod';
import { hasPermission } from 'src/providers/user/permission';
import { Permission } from 'src/types/user/permission';

// Router for handling admin-related functionality
@Router()
export class AdminRouter {
  constructor(private readonly adminService: AdminService) {}

  // Route to check if the user is authorized to access admin features
  // With authentication middleware
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      authorized: z.boolean(),
    }),
  })
  async isAuthorized(@Ctx() context: any) {
    // Return false if user is not authenticated
    if (!context.authorized) return { authorized: false };

    return {
      // Return authorization status based on result from admin service
      authorized: await this.adminService.checkIfAuthorized(context.user),
    };
  }

  // Route to list all users
  // With authentication middleware
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
    // Check if the user is authorized to access admin features
    if (!(await this.adminService.checkIfAuthorized(context.user)))
      return { users: [] };

    // Get all users from the admin service
    const users = await this.adminService.listUsers();

    // Return list of users with the needed fields
    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })),
    };
  }

  // Route to get statistics about the application
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      users: z.number(),
    }),
  })
  async getStats(@Ctx() context: any) {
    if (!(await this.adminService.checkIfAuthorized(context.user)))
      return { users: 0 };

    // Get statistics from the admin service
    const stats = await this.adminService.getStats();

    // Return the statistics with the needed fields
    return {
      users: stats.users,
    };
  }
}
