import { All, Controller, Inject, OnModuleInit } from '@nestjs/common';
import { renderTrpcPanel } from 'trpc-panel';
import { AnyRouter } from '@trpc/server';
import { AppRouterHost } from 'nestjs-trpc';

// Controller for development tools (e.g., tRPC panel)
@Controller()
export class DevController implements OnModuleInit {
  private appRouter!: AnyRouter;

  constructor(
    @Inject(AppRouterHost) private readonly appRouterHost: AppRouterHost,
  ) {}

  onModuleInit() {
    this.appRouter = this.appRouterHost.appRouter;
  }

  // TRPC panel route handler
  @All('/dev/trpc')
  panel(): string {
    return renderTrpcPanel(this.appRouter, {
      url: 'http://localhost:3000/trpc',
    });
  }
}
