import { Query, Router } from 'nestjs-trpc';
import { z } from 'zod';

@Router()
export class UserRouter {
  constructor() {}

  @Query({
    output: z.object({
      loggedIn: z.boolean(),
    }),
  })
  async isLoggedIn() {
    // TODO: Implement
    return {
      loggedIn: false,
    };
  }
}
