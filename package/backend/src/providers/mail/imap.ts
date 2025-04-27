import { ImapFlow } from 'imapflow';
import { extract } from 'letterparser';
import { convert } from 'html-to-text';

// Variable to store active IMAP sessions for reuse
let sessions: {
  [key: string]: ImapFlow;
} = {};

// Class for handling IMAP connections and email retrieval
export class Imap {
  private readonly host: string;
  private readonly port: string;
  private readonly user: string;
  private readonly password: string;
  private readonly secure: boolean = true;
  private readonly accountId: string;
  private connection: ImapFlow;

  constructor(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
    accountId: string;
  }) {
    // Assign the configuration values to the class properties
    this.host = conf.host;
    this.port = conf.port;
    this.user = conf.user;
    this.password = conf.password;
    this.secure = conf.secure ?? true;
    this.accountId = conf.accountId;

    // Retrieve the existing session or create a new one
    if (sessions[conf.accountId]) this.connection = sessions[conf.accountId];
    else this.createSession();
  }

  // Method for creating a new IMAP session
  async createSession() {
    // Create a new IMAP connection using the provided configuration
    this.connection = new ImapFlow({
      host: this.host,
      port: Number(this.port),
      secure: this.secure,
      auth: {
        user: this.user,
        pass: this.password,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
      logger: false,
    });
  }

  // Method to connect to the IMAP server
  async connect(forceReconnect: boolean = false) {
    // Connect to the server if not already connected or if forced
    if (
      !this.connection.authenticated ||
      (await this.testConnection()) === false ||
      forceReconnect
    )
      await this.connection.connect().catch();

    // Set the connection to the sessions object for reuse
    sessions[this.accountId] = this.connection;

    // Return the connection
    return this.connection;
  }

  // Method to test the connection to the IMAP server
  async testConnection() {
    // Check if connected by trying to list mailboxes
    const status = await this.connection.list().catch(() => '@err');

    // If not connected, return false
    return status != '@err';
  }

  // Method to disconnect from the IMAP server
  async disconnect() {
    // Close the mailbox and logout from the server
    await this.connection.mailboxClose().catch();
    await this.connection.logout().catch();

    // Remove the session from the sessions object
    delete sessions[this.accountId];
  }

  // Method to reconnect to the IMAP server
  async reconnect() {
    // Disconnect from the server
    await this.disconnect();

    // Wait for a second before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Connect to the server again
    await this.connect(true).catch();
  }

  // Method to list all mailboxes
  async mailboxList() {
    // Attempt to connect to the server
    await this.connect().catch();

    // Retrieve the list of mailboxes
    const data = await this.connection.list().catch();

    // Return the data
    return data;
  }

  async mailbox(id: string) {
    // Attempt to connect to the server
    await this.connect().catch();

    // Decode the mailbox ID
    id = decodeURIComponent(id);

    // If the ID starts with '@', find the mailbox by special use property
    if (id.startsWith('@')) {
      // List all mailboxes
      const boxes = await this.mailboxList().catch();

      // If no mailboxes found, return null
      if (!boxes) return null;

      // Find the mailbox with the special use property matching the ID
      id = boxes.find((a) => a.specialUse == `\\${id.slice(1)}`)?.path ?? '';
    }

    // Open the mailbox
    // Replace ':' with '/' in the mailbox ID
    // This is necessary because '/' would mess up the url
    const mbox = await this.connection
      .mailboxOpen(decodeURIComponent(id).replace(/\:/gm, '/'))
      .catch();

    // Return mailbox functions
    return {
      // Function to list messages in the mailbox
      list: async (page: number = 1) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // If the mailbox does not exist, return an empty array
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

        // Calculate the range of messages to fetch
        const mesagesTotal = (mbox as any)?.exists;
        const perPage = 20;
        const pages = Math.ceil(mesagesTotal / perPage);
        const startMessage = Math.max(mbox.exists - perPage * page + 1, 1);
        const endMessage = page == 1 ? '*' : mbox.exists - perPage * (page - 1);
        const range = `${startMessage}:${endMessage}`;

        // Fetch the messages from the mailbox
        const msgs = await this.connection.fetch(range, {
          envelope: true,
          source: true,
          flags: true,
        });

        // Variable to store the results
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

        // Iterate through the messages
        for await (const msg of msgs) {
          // Extract the data from the message source
          const data = extract(msg.source.toString());

          // Generate a preview of the message body by stripping HTML tags,
          // replacing new lines with spaces, and trimming the result
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

          // Variable to store the flags
          const flags: string[] = [];

          // Iterate through the flags and add them to the flags array
          msg.flags.forEach((flag) => flags.push(flag));

          // Push the message data to the result array
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

        // Return the result array and metadata
        // Reverse the result array to show the latest messages first
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
      // Function to get a specific message by ID
      message: async (id: string) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // Search for the message by ID
        let searchResults = await this.connection.search({
          uid: id,
        });

        // If no search results found, try searching by Message-ID
        // This is a fallback in case we get the full message Id instead of the uid
        if (!searchResults || searchResults.length < 1) {
          searchResults = await this.connection.search({
            header: { 'Message-ID': id },
          });
        }

        // Fetch the message from the search results
        const msg = await this.connection.fetchOne(
          searchResults[0].toString(),
          {
            envelope: true,
            source: true,
            flags: true,
            headers: true,
          },
        );

        // Extract the data from the message source
        const data = extract(msg.source.toString());

        // Variable to store the flags
        const flags: string[] = [];

        // Iterate through the flags and add them to the flags array
        msg.flags.forEach((flag) => flags.push(flag));

        // Create a headers object from the message headers
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

        // Generate a preview of the message body by stripping HTML tags,
        // replacing new lines with spaces, and trimming the result
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

        // Return the message data
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
      // Function to get the raw message source by ID
      rawMessage: async (id: string) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // Search for the message by ID
        const searchResults = await this.connection.search({
          uid: id,
        });

        // Fetch the message source from the search results
        const msg = await this.connection.fetchOne(
          searchResults[0].toString(),
          {
            source: true,
          },
        );

        // Return the raw message source
        return msg.source.toString();
      },
      // Function to add a flag to a message by ID
      addFlag: async (id: string, flag: string) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // Search for the message by ID
        const searchResults = await this.connection.search({
          uid: id,
        });

        // Add the flag to the message
        await this.connection.messageFlagsAdd(searchResults[0].toString(), [
          flag,
        ]);

        // Return the message ID and flag
        return {
          id: searchResults[0].toString(),
          flag,
        };
      },
      // Function to remove a flag from a message by ID
      removeFlag: async (id: string, flag: string) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // Search for the message by ID
        const searchResults = await this.connection.search({
          uid: id,
        });

        // Remove the flag from the message
        await this.connection.messageFlagsRemove(searchResults[0].toString(), [
          flag,
        ]);

        // Return the message ID and flag
        return {
          id: searchResults[0].toString(),
          flag,
        };
      },
      // Function to move a message to a different mailbox by ID
      move: async (id: string, destination: string) => {
        // Attempt to connect to the server
        await this.connect().catch();

        // Search for the message by ID
        const searchResults = await this.connection.search({
          uid: id,
        });

        // Move the message to the destination mailbox
        await this.connection.messageMove(
          searchResults[0].toString(),
          destination,
        );

        // Return the message ID
        return {
          id: searchResults[0].toString(),
        };
      },
    };
  }

  // Function to create a new instance of the Imap class
  static async connect(conf: {
    host: string;
    port: string;
    user: string;
    password: string;
    secure?: boolean;
    accountId: string;
  }) {
    return new this(conf);
  }
}
