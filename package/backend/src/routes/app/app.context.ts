import { Inject, Injectable } from '@nestjs/common';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';

// App context
// Used for holding information about authentication, encryption, etc.
@Injectable()
export class AppContext implements TRPCContext {
  constructor() {}

  // Create a context for the request
  async create(opts: ContextOptions): Promise<Record<string, unknown>> {
    return {
      headers: opts.req.headers, // Headers from the request
      req: opts.req, // Request object
      res: opts.res, // Response object
    };
  }
}
