import { ImapFlow } from 'imapflow';
import { extract } from 'letterparser';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';

export class Imap {
  private readonly host: string;
  private readonly port: string;
  private readonly user: string;
  private readonly password: string;
  private readonly secure: boolean = true;
  private connection: ImapFlow;

  constructor(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
  }) {
    this.host = conf.host;
    this.port = conf.port;
    this.user = conf.user;
    this.password = conf.password;
    this.secure = conf.secure ?? true;
  }

  async connect() {
    try {
      this.connection = new ImapFlow({
        host: this.host,
        port: Number(this.port),
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
        logger: false,
      });

      this.connection.on('error', (err) => {
        console.error('Connection error:', err);

        this.connect();
      });

      await this.connection.connect().catch();
    } catch (e) {}
  }

  async isConnected() {
    return (
      this.connection.authenticated &&
      (await this.connection.list().catch(() => '@err')) != '@err'
    );
  }

  async mailboxList() {
    return await this.connection.list().catch();
  }

  async mailbox(id: string) {
    id = decodeURIComponent(id);

    if (id.startsWith('@')) {
      const boxes = await this.mailboxList().catch();

      id = boxes.find((a) => a.specialUse == `\\${id.slice(1)}`)?.path ?? '';
    }

    const mbox = await this.connection
      .mailboxOpen(decodeURIComponent(id).replace(/\:/gm, '/'))
      .catch();

    return {
      list: async (page: number = 1) => {
        if (mbox.exists == 0)
          return {
            data: [],
            meta: {
              page,
              total: 0,
              totalPages: 0,
              perPage: 0,
            },
          };

        const mesagesTotal = mbox.exists;
        const perPage = 20;
        const pages = Math.ceil(mesagesTotal / perPage);
        const startMessage = Math.max(mbox.exists - perPage * page + 1, 1);
        const endMessage = page == 1 ? '*' : mbox.exists - perPage * (page - 1);
        const range = `${startMessage}:${endMessage}`;

        const msgs = await this.connection.fetch(range, {
          envelope: true,
          source: true,
          flags: true,
        });

        let result: {
          id: string;
          subject: string;
          sender: {
            name: string;
            email: string;
          };
          body: string;
          date: Date;
          flags: string[];
          files: {
            name: string;
          }[];
        }[] = [];

        for await (const msg of msgs) {
          const data = extract(msg.source.toString());

          let preview = convert(data.html ?? data.text ?? '', {
            selectors: [
              {
                selector: 'a',
                format: 'skip',
              },
              {
                selector: 'img',
                format: 'skip',
              },
            ],
          })
            .replace(/[\n\r]/g, ' ')
            .trim()
            .substring(0, 120);

          const flags: string[] = [];

          msg.flags.forEach((flag) => flags.push(flag));

          result.push({
            id: msg.uid.toString() ?? '',
            subject: data.subject ?? '',
            sender: {
              name: data.from?.name ?? '',
              email: data.from?.address ?? '',
            },
            body: preview.length < 1 ? (data.text ?? '') : (preview ?? ''),
            date: msg.envelope.date ?? new Date(0),
            flags: flags,
            files:
              data.attachments?.map((a) => ({
                name: a.filename ?? '',
              })) ?? [],
          });
        }

        return {
          data: result.reverse(),
          meta: {
            page,
            total: mesagesTotal,
            totalPages: pages,
            perPage,
          },
        };
      },
      message: async (id: string) => {
        let searchResults = await this.connection.search({
          uid: id,
        });

        if (!searchResults || searchResults.length < 1) {
          searchResults = await this.connection.search({
            header: { 'Message-ID': id },
          });
        }

        const msg = await this.connection.fetchOne(
          searchResults[0].toString(),
          {
            envelope: true,
            source: true,
            flags: true,
            headers: true,
          },
        );

        const data = extract(msg.source.toString());

        const flags: string[] = [];

        msg.flags.forEach((flag) => flags.push(flag));

        const headers = Object.fromEntries(
          msg.headers
            .toString()
            .split('\n')
            .map((a) =>
              a
                .trim()
                .split(': ')
                .map((b) => b.trim()),
            ),
        );

        const preview = convert(data.html ?? data.text ?? '', {
          selectors: [
            {
              selector: 'a',
              format: 'skip',
            },
            {
              selector: 'img',
              format: 'skip',
            },
          ],
        })
          .replace(/[\n\r]/g, ' ')
          .trim()
          .substring(0, 120);

        return {
          id: msg.uid.toString() ?? '',
          subject: data.subject ?? '',
          sender: {
            name: data.from?.name ?? '',
            email: data.from?.address ?? '',
          },
          flags,
          body: data.html ?? data.text ?? '',
          preview: preview.length < 1 ? (data.text ?? '') : (preview ?? ''),
          date: msg.envelope.date ?? new Date(0),
          headers: headers,
          files:
            data.attachments?.map((a) => ({
              name: a.filename,
              id: a.contentId ?? '',
              type: a.contentType.type,
              content:
                typeof a.body == 'string'
                  ? a.body
                  : Buffer.from(a.body).toString('base64'),
            })) ?? [],
        };
      },
      addFlag: async (id: string, flag: string) => {
        const searchResults = await this.connection.search({
          uid: id,
        });

        await this.connection.messageFlagsAdd(searchResults[0].toString(), [
          flag,
        ]);

        return {
          id: searchResults[0].toString(),
          flag,
        };
      },
      removeFlag: async (id: string, flag: string) => {
        const searchResults = await this.connection.search({
          uid: id,
        });

        await this.connection.messageFlagsRemove(searchResults[0].toString(), [
          flag,
        ]);

        return {
          id: searchResults[0].toString(),
          flag,
        };
      },
      move: async (id: string, destination: string) => {
        const searchResults = await this.connection.search({
          uid: id,
        });

        await this.connection.messageMove(
          searchResults[0].toString(),
          destination,
        );

        return {
          id: searchResults[0].toString(),
        };
      },
    };
  }

  static async connect(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
  }) {
    const instance = new this(conf);
    await instance.connect().catch();

    return instance;
  }
}
