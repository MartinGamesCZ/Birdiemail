import { Inject, Injectable } from '@nestjs/common';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';

@Injectable()
export class AppContext implements TRPCContext {
  constructor() {}

  async create(opts: ContextOptions): Promise<Record<string, unknown>> {
    return {
      headers: opts.req.headers,
      req: opts.req,
      res: opts.res,
    };
  }
}
