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

// Router for handling mail-related functionality
@Router()
export class MailRouter {
  constructor(
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}

  // Route to get a list of emails in a mailbox
  // Uses authentication middleware
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
            internal: z.optional(
              z.object({
                name: z.string(),
              }),
            ),
          }),
          body: z.string(),
          flags: z.array(z.string()),
          date: z.date(),
          headers: z.record(z.string(), z.any()),
          files: z.array(
            z.object({
              name: z.string(),
            }),
          ),
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
    // Use the mail service to get the list of emails
    return await this.mailService.getMail(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.page,
    );
  }

  // Route to get a specific email message
  // Uses authentication middleware
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
        internal: z.optional(
          z.object({
            name: z.string(),
          }),
        ),
      }),
      flags: z.array(z.string()),
      body: z.string(),
      date: z.date(),
      headers: z.record(z.string(), z.any()),
      preview: z.string(),
      files: z.array(
        z.object({
          name: z.string(),
          content: z.string(),
          type: z.string(),
          id: z.string(),
        }),
      ),
    }),
  })
  async getMailMessage(
    @Ctx() context: any,
    @Input() data: { accountId: string; mailbox: string; messageId: string },
  ) {
    // Use the mail service to get the specific email message
    const res = await this.mailService.getMailMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
    );

    // Return the result
    return res;
  }

  // Route to get the raw content of a specific email message
  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
    }),
    output: z.string(),
  })
  async getRawMailMessage(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
    },
  ) {
    // Use the mail service to get the raw content of the email message
    return await this.mailService.getRawMailMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
    );
  }

  // Route to delete a specific email message
  // Uses authentication middleware
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
    // Use the mail service to add a flag to the email message
    return await this.mailService.addMailMessageFlag(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.flag,
    );
  }

  // Route to remove a flag from a specific email message
  // Uses authentication middleware
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
    // Use the mail service to remove a flag from the email message
    return await this.mailService.removeMailMessageFlag(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.flag,
    );
  }

  // Route to move a specific email message to another mailbox
  // Uses authentication middleware
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
    // Use the mail service to move the email message to another mailbox
    return await this.mailService.moveMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
      data.destination,
    );
  }

  // Route to send an email message
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
        headers: z.record(z.string(), z.any()),
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
        headers: Record<string, any>;
      };
    },
  ) {
    // Use the mail service to send the email message
    return await this.mailService.sendMessage(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.data,
    );
  }

  // Route to get a list of mailboxes for a specific account
  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      accountId: z.string(),
    }),
    output: z.array(
      z.object({
        name: z.string(),
        flags: z.array(z.string()),
      }),
    ),
  })
  async getMailboxes(
    @Ctx() context: any,
    @Input() data: { accountId: string },
  ) {
    // Use the mail service to get the list of mailboxes
    return await this.mailService.getMailboxes(
      context.user,
      context.encryptionKey,
      data.accountId,
    );
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      accountId: z.string(),
      mailbox: z.string(),
      messageId: z.string(),
    }),
    output: z.object({
      id: z.string(),
    }),
  })
  async deleteMailMessage(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
    },
  ) {
    // Use the mail service to delete the email message
    return await this.mailService.deleteMessage(
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
    }),
    output: z.void(),
  })
  async privacyMailingListUnsubscribe(
    @Ctx() context: any,
    @Input()
    data: {
      accountId: string;
      mailbox: string;
      messageId: string;
    },
  ) {
    // Use the mail service to unsubscribe from the mailing list
    return await this.mailService.privacyMailingListUnsubscribe(
      context.user,
      context.encryptionKey,
      data.accountId,
      data.mailbox,
      data.messageId,
    );
  }
}
