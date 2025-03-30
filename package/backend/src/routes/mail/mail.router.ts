import { Query, Router } from 'nestjs-trpc';
import { Imap } from 'src/providers/mail/imap';
import { z } from 'zod';

@Router()
export class MailRouter {
  private readonly connections = new Map<string, Imap>();

  @Query({
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
  async getMail() {
    const imap = await this.establishConnection('martin');

    return await (await imap.mailbox('INBOX')).list();
  }

  private async establishConnection(id: string) {
    let connection = this.connections.get(id);

    if (!connection)
      connection = await Imap.connect({
        host: 'xxxxxxxxxx',
        port: '143',
        user: 'xxxxxxxxx',
        password: 'xxxxxxxxxxxx',
      });

    if (!connection.isConnected()) await connection.connect();

    this.connections.set(id, connection);

    return connection;
  }
}
