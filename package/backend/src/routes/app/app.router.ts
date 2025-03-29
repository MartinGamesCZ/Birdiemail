import { Query, Router } from 'nestjs-trpc';
import { z } from 'zod';

@Router()
export class AppRouter {
  constructor() {}

  @Query({
    output: z.object({
      hello: z.string(),
    }),
  })
  async hello() {
    return {
      hello: 'world',
    };
  }
}
