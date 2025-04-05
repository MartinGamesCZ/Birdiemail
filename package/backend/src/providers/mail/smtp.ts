import { ImapFlow } from 'imapflow';
import { extract } from 'letterparser';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';
import { createTransport, Transporter } from 'nodemailer';

export class Smtp {
  private readonly host: string;
  private readonly port: string;
  private readonly user: string;
  private readonly password: string;
  private readonly secure: boolean = true;
  private connection: Transporter;

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
    this.connection = createTransport({
      host: this.host,
      port: Number(this.port),
      secure: false,
      auth: {
        user: this.user,
        pass: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.connection.on('error', (err) => {
      console.error('Connection error:', err);

      this.connect();
    });
  }

  async send(data: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    attachments?: { filename: string; content: Buffer; contentType: string }[];
  }) {
    return await this.connection.sendMail({
      from: data.from,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      text: data.body,
      html: data.body,
      attachments: data.attachments,
    });
  }

  static async connect(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
  }) {
    const instance = new this(conf);
    await instance.connect();

    return instance;
  }
}
