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
      mailbox: z.string(),
      page: z.number().optional().default(1),
    }),
    output: z.object({
      data: z.array(
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
      meta: z.object({
        page: z.number(),
        total: z.number(),
        totalPages: z.number(),
        perPage: z.number(),
      }),
    }),
  })
  async getMail(
    @Ctx() context: any,
    @Input() data: { accountId: string; page: number; mailbox: string },
  ) {
    return await this.mailService.getMail(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.page,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
    }),
    output: z.object({
      id: z.string(),
      subject: z.string(),
      sender: z.object({
        name: z.string(),
        email: z.string(),
      }),
      body: z.string(),
      date: z.date(),
    }),
  })
  async getMailMessage(
    @Ctx() context: any,
    @Input() data: { accountId: string; mailbox: string; messageId: string },
  ) {
    return await this.mailService.getMailMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
    );
  }
}
