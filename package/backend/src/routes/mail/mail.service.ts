import { Injectable } from '@nestjs/common';
import { Repo } from 'src/db/_index';
import { MailAccountEntity } from 'src/db/mailaccount.entity';
import { UserEntity } from 'src/db/user.entity';
import { Imap } from 'src/providers/mail/imap';
import { Smtp } from 'src/providers/mail/smtp';
import { decryptMailPassword } from 'src/utils/encryption';
import { UserService } from '../user/user.service';
import { OkResponse } from 'src/utils/response';

@Injectable()
export class MailService {
  private readonly smtpConnections = new Map<string, Smtp>();

  constructor(private readonly userService: UserService) {}

  // Function to get a list of emails in a mailbox
  async getMail(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    page: number = 1,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Fetch the list of emails in the specified mailbox
    const res = await (await connection.mailbox(mailbox))?.list(page);

    const out: any[] = [];

    for (const message of res?.data ?? []) {
      // Get sender details if sent using birdiemail
      const sender = message.headers.internal?.sender?.accountId;

      if (sender) {
        // Get the sender account details
        const senderAccount = await Repo.mailAccount.findOne({
          where: {
            id: sender,
          },
        });

        // If sender account is found, set the sender details in the message
        if (senderAccount)
          message.sender = {
            ...message.sender,
            internal: {
              name: senderAccount.name,
            },
          } as any;
      }

      // Add the message to the output array
      out.push(message);
    }

    // Return the data
    return {
      ...res,
      data: out,
    };
  }

  // Function to get a specific email message
  async getMailMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Fetch the email message from the specified mailbox
    const message: any = await (
      await connection.mailbox(mailbox)
    )?.message(messageId);

    if (!message) return message;

    // Get sender details if sent using birdiemail
    const sender = message.headers.internal?.sender?.accountId;

    if (sender) {
      // Get the sender account details
      const senderAccount = await Repo.mailAccount.findOne({
        where: {
          id: sender,
        },
      });

      // If sender account is found, set the sender details in the message
      if (senderAccount)
        message.sender = {
          ...message.sender,
          internal: {
            name: senderAccount.name,
          },
        };
    }

    // Return the email message
    return message;
  }

  // Function to get the raw email message
  async getRawMailMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return '';

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Fetch the raw email message from the specified mailbox
    return await (await connection.mailbox(mailbox))?.rawMessage(messageId);
  }

  // Function to add a flag to an email message
  async addMailMessageFlag(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    flag: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Add the specified flag to the email message in the mailbox
    return await (await connection.mailbox(mailbox))?.addFlag(messageId, flag);
  }

  // Function to remove a flag from an email message
  async removeMailMessageFlag(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    flag: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Remove the specified flag from the email message in the mailbox
    return await (
      await connection.mailbox(mailbox)
    )?.removeFlag(messageId, flag);
  }

  // Function to move an email message to a different mailbox
  async moveMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    destination: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Move the email message to the specified destination mailbox
    return await (
      await connection.mailbox(mailbox)
    )?.move(messageId, destination);
  }

  // Function to send an email message
  async sendMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    data: {
      to: string;
      cc?: string;
      bcc?: string;
      subject: string;
      body: string;
      headers?: Record<string, string>;
      attachments: {
        name: string;
        content: string;
      }[];
    },
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'name', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the SMTP server
    const connection = await this.establishSmtpConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    // Send the email message using the SMTP connection
    return await connection.send({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body: data.body,
      from: `${mailAccount.name} <${mailAccount.email}>`,
      headers: {
        ...data.headers,
        // Add custom headers for Birdiemail
        'X-Mailer': 'Birdiemail',
        'X-Birdie-Client': 'Birdiemail',
        'X-Birdie-User-Id': user.id,
        'X-Birdie-Account-Id': mailAccount.id,
        'X-Birdie-Scheduled-At': new Date().toISOString(),
      },
      attachments: data.attachments.map((f) => ({
        // Decode the base64 content and set the filename and content type
        content: Buffer.from(
          f.content.includes('base64,')
            ? f.content.split('base64,')[1]
            : f.content,
          'base64',
        ),
        filename: f.name,
        // Extract the content type from the base64 string or use the file extension
        contentType: f.content.includes('base64,')
          ? f.content.split(';')[0].split(':')[1]
          : (f.name.split('.').pop() ?? ''),
      })),
    });
  }

  // Function to get a list of mailboxes
  async getMailboxes(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Fetch the list of mailboxes from the IMAP server
    const res = (await connection.mailboxList())?.map((m) => ({
      name: m.name,
      flags: [m.specialUse ?? ''],
    }));

    // Return the list of mailboxes
    return res;
  }

  // Function to delete an email message permanently
  async deleteMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return [];
    if (!encryptionKey) return [];

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return [];

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Permanently delete the email message from the specified mailbox
    return await (await connection.mailbox(mailbox))?.delete(messageId);
  }

  // PRIVACY
  // Function to unsubscribe from a mailing list
  async privacyMailingListUnsubscribe(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    // Return if user or encryptionKey is not provided
    if (!user) return;
    if (!encryptionKey) return;

    // Find the mail account associated with the user
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
      select: ['id', 'email', 'password', 'mailServer'],
    });

    // Return if mail account is not found
    if (!mailAccount) return;

    // Establish a connection to the IMAP server
    const connection = await this.establishImapConnection(
      mailAccount,
      encryptionKey,
    );

    // Get the email message from the specified mailbox
    const message: any = await (
      await connection.mailbox(mailbox)
    )?.message(messageId);

    // Extract the unsubscribe link from the email message
    const unsubscribeLink = message.headers['List-Unsubscribe']
      .trim()
      .split(',')
      .map((l) => l.trim().replace(/\<(.*?)\>/gm, '$1'));
    const unsubscribeData = Object.fromEntries([
      message.headers['List-Unsubscribe-Post']?.split('='),
    ]);

    // Send a POST request to the unsubscribe link with the unsubscribe data
    const { status } = await fetch(
      unsubscribeLink.find((l) => l.startsWith('http')),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(unsubscribeData),
      },
    );

    return;
  }

  // Function to establish a connection to the IMAP server
  private async establishImapConnection(
    mailAccount: MailAccountEntity,
    encryptionKey: string,
  ) {
    // Create and return a new IMAP connection
    return await Imap.connect({
      host: mailAccount.mailServer.imapAddress,
      port: mailAccount.mailServer.imapPort,
      user: mailAccount.email,
      password: decryptMailPassword(encryptionKey, mailAccount.password),
      secure: mailAccount.mailServer.imapSecure,
      accountId: mailAccount.id,
    });
  }

  // Function to establish a connection to the SMTP server
  private async establishSmtpConnection(
    id: string,
    mailAccount: MailAccountEntity,
    encryptionKey: string,
  ) {
    // Check if the SMTP connection already exists
    let connection = this.smtpConnections.get(id);

    // If the connection does not exist, create a new one
    if (!connection) {
      // Create a new SMTP connection
      connection = await Smtp.connect({
        host: mailAccount.mailServer.smtpAddress,
        port: mailAccount.mailServer.smtpPort,
        user: mailAccount.email,
        password: decryptMailPassword(encryptionKey, mailAccount.password),
        secure: mailAccount.mailServer.imapSecure,
      });

      // Connect to the SMTP server
      await connection.connect();
    }

    // Save the connection to the map for future use
    this.smtpConnections.set(id, connection);

    // Return the SMTP connection
    return connection;
  }
}
