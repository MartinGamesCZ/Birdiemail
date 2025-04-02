import { Injectable } from '@nestjs/common';
import { Repo } from 'src/db/_index';
import { MailAccountEntity } from 'src/db/mailaccount.entity';
import { UserEntity } from 'src/db/user.entity';
import { Imap } from 'src/providers/mail/imap';
import { decryptMailPassword } from 'src/utils/encryption';

@Injectable()
export class MailService {
  private readonly connections = new Map<string, Imap>();

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

    const connection = await this.establishConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection.mailbox(mailbox)).list(page);
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

    const connection = await this.establishConnection(
      mailAccount.id,
      mailAccount,
      encryptionKey,
    );

    return await (await connection.mailbox(mailbox)).message(messageId);
  }

  private async establishConnection(
    id: string,
    mailAccount: MailAccountEntity,
    encryptionKey: string,
  ) {
    let connection = this.connections.get(id);

    if (!connection)
      connection = await Imap.connect({
        host: mailAccount.mailServer.imapAddress,
        port: mailAccount.mailServer.imapPort,
        user: mailAccount.email,
        password: decryptMailPassword(encryptionKey, mailAccount.password),
        secure: mailAccount.mailServer.imapSecure,
      });

    if (!connection.isConnected()) await connection.connect();

    this.connections.set(id, connection);

    return connection;
  }
}
