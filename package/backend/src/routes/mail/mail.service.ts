import { Injectable } from '@nestjs/common';
import { Repo } from 'src/db/_index';
import { MailAccountEntity } from 'src/db/mailaccount.entity';
import { UserEntity } from 'src/db/user.entity';
import { Imap } from 'src/providers/mail/imap';
import { Smtp } from 'src/providers/mail/smtp';
import { decryptMailPassword } from 'src/utils/encryption';

@Injectable()
export class MailService {
  private readonly imapConnections = new Map<string, Imap>();
  private readonly smtpConnections = new Map<string, Smtp>();

  async getMail(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    page: number = 1,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    const res = await (await connection!.mailbox(mailbox))!.list(page);

    if (!res) {
      const connection = await this.establishImapConnection(
        mailAccount.id,
        mailAccount,
        encryptionKey,
        true,
      );

      return await (await connection!.mailbox(mailbox))!.list(page);
    }

    return res;
  }

  async getMailMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection!.mailbox(mailbox))!.message(messageId);
  }

  async getRawMailMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return '';

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection!.mailbox(mailbox))!.rawMessage(messageId);
  }

  async addMailMessageFlag(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    flag: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection!.mailbox(mailbox))!.addFlag(messageId, flag);
  }

  async removeMailMessageFlag(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    flag: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection!.mailbox(mailbox))!.removeFlag(
      messageId,
      flag,
    );
  }

  async moveMessage(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
    mailbox: string,
    messageId: string,
    destination: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection!.mailbox(mailbox))!.move(
      messageId,
      destination,
    );
  }

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
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishSmtpConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await connection.send({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body: data.body,
      from: `${mailAccount.name} <${mailAccount.email}>`,
      headers: {
        ...data.headers,
        'X-Mailer': 'Birdiemail',
        'X-Birdie-Client': 'Birdiemail',
        'X-Birdie-User-Id': user.id,
        'X-Birdie-Account-Id': mailAccount.id,
        'X-Birdie-Scheduled-At': new Date().toISOString(),
      },
      attachments: data.attachments.map((f) => ({
        content: Buffer.from(
          f.content.includes('base64,')
            ? f.content.split('base64,')[1]
            : f.content,
          'base64',
        ),
        filename: f.name,
        contentType: f.content.includes('base64,')
          ? f.content.split(';')[0].split(':')[1]
          : (f.name.split('.').pop() ?? ''),
      })),
    });
  }

  async getMailboxes(
    user: UserEntity,
    encryptionKey: string,
    accountId: string,
  ) {
    if (!user) return [];
    if (!encryptionKey) return [];

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
    if (!mailAccount) return [];

    const connection = await this.establishImapConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    const res = (await connection!.mailboxList())!.map((m) => ({
      name: m.name,
      flags: [m.specialUse ?? ''],
    }));

    if (!res) {
      const connection = await this.establishImapConnection(
        mailAccount.id,
        mailAccount,
        encryptionKey,
        true,
      );

      return (await connection!.mailboxList())!.map((m) => ({
        name: m.name,
        flags: [m.specialUse ?? ''],
      }));
    }

    return res;
  }

  private async establishImapConnection(
    id: string,
    mailAccount: MailAccountEntity,
    encryptionKey: string,
    forceReconnect: boolean = false,
  ) {
    try {
      let connection = this.imapConnections.get(id);

      if (!connection || forceReconnect)
        connection = await Imap.connect({
          host: mailAccount.mailServer.imapAddress,
          port: mailAccount.mailServer.imapPort,
          user: mailAccount.email,
          password: decryptMailPassword(encryptionKey, mailAccount.password),
          secure: mailAccount.mailServer.imapSecure,
        });

      if (!connection || !connection.isConnected()) await connection!.connect();

      this.imapConnections.set(id, connection!);

      return connection;
    } catch (e) {}
  }

  private async establishSmtpConnection(
    id: string,
    mailAccount: MailAccountEntity,
    encryptionKey: string,
  ) {
    let connection = this.smtpConnections.get(id);

    if (!connection) {
      connection = await Smtp.connect({
        host: mailAccount.mailServer.smtpAddress,
        port: mailAccount.mailServer.smtpPort,
        user: mailAccount.email,
        password: decryptMailPassword(encryptionKey, mailAccount.password),
        secure: mailAccount.mailServer.imapSecure,
      });

      await connection.connect();
    }

    this.smtpConnections.set(id, connection);

    return connection;
  }
}
