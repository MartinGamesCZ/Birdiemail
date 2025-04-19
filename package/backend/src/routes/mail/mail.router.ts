import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
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
          flags: z.array(z.string()),
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
      flags: z.array(z.string()),
      body: z.string(),
      date: z.date(),
      headers: z.record(z.string(), z.any()),
      preview: z.string(),
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

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      flag: z.string(),
    }),
    output: z.object({
      id: z.string(),
      flag: z.string(),
    }),
  })
  async addMailMessageFlag(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
      flag: string;
    },
  ) {
    return await this.mailService.addMailMessageFlag(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.flag,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      flag: z.string(),
    }),
    output: z.object({
      id: z.string(),
      flag: z.string(),
    }),
  })
  async removeMailMessageFlag(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
      flag: string;
    },
  ) {
    return await this.mailService.removeMailMessageFlag(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.flag,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
      destination: z.string(),
    }),
    output: z.object({
      id: z.string(),
    }),
  })
  async moveMailMessage(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
      destination: string;
    },
  ) {
    return await this.mailService.moveMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.destination,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      accountId: z.string(),
      data: z.object({
        to: z.string(),
        cc: z.string().optional(),
        bcc: z.string().optional(),
        subject: z.string(),
        body: z.string(),
        attachments: z.array(
          z.object({
            name: z.string(),
            content: z.string(),
          }),
        ),
      }),
    }),
  })
  async sendMailMessage(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      data: {
        to: string;
        cc?: string;
        bcc?: string;
        subject: string;
        body: string;
        attachments: {
          name: string;
          content: string;
        }[];
      };
    },
  ) {
    return await this.mailService.sendMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.data,
    );
  }
}
