import { Ctx, Input, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { Imap } from 'src/providers/mail/imap';
import { z } from 'zod';
import { AuthMiddleware } from '../auth.middleware';
import { Inject } from '@nestjs/common';
import { MailService } from './mail.service';

@Router()
export class MailRouter {
  constructor(
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      accountId: z.string(),
    }),
    output: z.array(
      z.object({
        id: z.string(),
        subject: z.string(),
        sender: z.object({
          name: z.string(),
          email: z.string(),
        }),
        body: z.string(),
        date: z.date(),
      }),
    ),
  })
  async getMail(@Ctx() context: any, @Input() data: { accountId: string }) {
    return await this.mailService.getMail(
      context.user,
      context.encryptionKey,
      data.accountId,
    );
  }
}
