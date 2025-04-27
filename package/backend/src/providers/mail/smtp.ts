import { ImapFlow } from 'imapflow';
import { extract } from 'letterparser';
import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';
import { createTransport, Transporter } from 'nodemailer';

// Class for handling SMTP connections and email sending
export class Smtp {
  private readonly host: string;
  private readonly port: string;
  private readonly user: string;
  private readonly password: string;
  private readonly secure: boolean = true; // Unused because we are using STARTTLS for now
  private connection: Transporter;

  constructor(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
  }) {
    // Assign the configuration values to the class properties
    this.host = conf.host;
    this.port = conf.port;
    this.user = conf.user;
    this.password = conf.password;
    this.secure = conf.secure ?? true;
  }

  // Method to connect to the SMTP server
  async connect() {
    // Create a new SMTP connection using the provided configuration
    this.connection = createTransport({
      host: this.host,
      port: Number(this.port),
      secure: false,
      auth: {
        user: this.user,
        pass: this.password,
      },
      tls: {
        // Do not fail on invalid certs
        // This is useful for self-signed certs
        rejectUnauthorized: false,
      },
    });

    // Log the connection errors
    this.connection.on('error', (err) => {
      console.error('Connection error:', err);

      // Attempt to reconnect if there is an error
      this.connect();
    });
  }

  // Method for sending an email
  async send(data: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    attachments?: { filename: string; content: Buffer; contentType: string }[];
    headers?: Record<string, string>;
  }) {
    // Send the email using the SMTP connection
    return await this.connection.sendMail({
      from: data.from,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      text: data.body,
      html: data.body,
      attachments: data.attachments,
      headers: data.headers,
    });
  }

  // Method to check for valid credentials
  async isAuthenticated() {
    // Attempt to verify the connection
    const res = await this.connection.verify().catch(() => false);

    // Return true if the connection is verified, false otherwise
    return res;
  }

  // Function to create a new instance of the Smtp class and connect
  static async connect(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
  }) {
    // Create a new instance of the Smtp class and connect to the server
    const instance = new this(conf);
    await instance.connect();

    // Return the instance
    return instance;
  }
}
