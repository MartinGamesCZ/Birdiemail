import { ImapFlow } from 'imapflow';
import { extract } from 'letterparser';
import { convert } from 'html-to-text';
import { parseInternalHeaders, parseMailHeaders } from './headers';

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
  private readonly maxRetries: number = 3;

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

  // Utility method to safely execute IMAP operations with error handling and retry logic
  private async safeExec<T>(
    operation: () => Promise<T>,
    retries: number = 0,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      console.error(`IMAP operation failed: ${error.message}`);

      // If we have retries left and connection appears to be the issue
      if (retries < this.maxRetries) {
        try {
          // Attempt to reconnect
          await this.reconnect();
          // Retry the operation with one less retry attempt
          return await this.safeExec(operation, retries + 1);
        } catch (reconnectError) {
          console.error(`Failed to reconnect: ${reconnectError.message}`);
        }
      }

      // Return null to indicate failure after retries
      return null;
    }
  }

  // Method for creating a new IMAP session
  async createSession() {
    try {
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

      // Set up error event handler to prevent crashes
      this.connection.on('error', (err) => {
        console.error(`IMAP connection error: ${err.message}`);
        // Mark the connection as needing reconnection
        this.connection.authenticated = false;
      });
    } catch (error) {
      console.error(`Failed to create IMAP session: ${error.message}`);
      throw error; // Propagate the error as this is a critical operation
    }
  }

  // Method to connect to the IMAP server
  async connect(forceReconnect: boolean = false) {
    try {
      // Connect to the server if not already connected or if forced
      if (
        !this.connection.authenticated ||
        (await this.testConnection()) === false ||
        forceReconnect
      ) {
        await this.connection.connect().catch((error) => {
          console.error(`IMAP connection failed: ${error.message}`);

          // If we can't reuse the ImapFlow instance, create a new one
          if (
            error.message &&
            error.message.includes('Can not re-use ImapFlow instance')
          ) {
            throw new Error('CONNECTION_NEEDS_RESET');
          }

          throw error;
        });
      }

      // Set the connection to the sessions object for reuse
      sessions[this.accountId] = this.connection;

      // Return the connection
      return this.connection;
    } catch (error) {
      console.error(`Failed to connect to IMAP server: ${error.message}`);

      // Special handling for connection reset needs
      if (error.message === 'CONNECTION_NEEDS_RESET') {
        console.log('Connection needs reset, creating new session');
        delete sessions[this.accountId];
        await this.createSession();
        return this.connect(true);
      }

      throw error; // Propagate the error as this is a critical operation
    }
  }

  // Method to test the connection to the IMAP server
  async testConnection() {
    try {
      // Check if connected by trying to list mailboxes
      const status = await this.connection.list().catch(() => '@err');

      // If not connected, return false
      return status != '@err';
    } catch (error) {
      console.error(`Error testing IMAP connection: ${error.message}`);
      return false;
    }
  }

  // Method to disconnect from the IMAP server
  async disconnect() {
    try {
      // Close the mailbox and logout from the server
      await this.connection.mailboxClose().catch((error) => {
        console.error(`Error closing mailbox: ${error.message}`);
      });

      await this.connection.logout().catch((error) => {
        console.error(`Error logging out: ${error.message}`);
      });

      // Remove the session from the sessions object
      delete sessions[this.accountId];
    } catch (error) {
      console.error(`Error during IMAP disconnect: ${error.message}`);
      // Continue execution as this is a cleanup operation
    }
  }

  // Method to reconnect to the IMAP server
  async reconnect() {
    try {
      // Disconnect from the server
      await this.disconnect();

      // Wait for a second before reconnecting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new ImapFlow instance instead of reusing the existing one
      await this.createSession();

      // Connect to the server again
      await this.connect(true);
    } catch (error) {
      console.error(`Error during IMAP reconnection: ${error.message}`);

      // If we get "Can not re-use ImapFlow instance", create a new session and try again
      if (
        error.message &&
        error.message.includes('Can not re-use ImapFlow instance')
      ) {
        console.log('Creating new ImapFlow instance due to reuse error');
        try {
          // Remove the session from global sessions
          delete sessions[this.accountId];

          // Create a completely new session
          await this.createSession();

          // Connect to the server again
          await this.connect(true);
        } catch (secondError) {
          console.error(
            `Second reconnection attempt failed: ${secondError.message}`,
          );
          throw secondError;
        }
      } else {
        throw error; // Propagate other errors
      }
    }
  }

  // Method to list all mailboxes
  async mailboxList() {
    // Use safeExec to handle errors and retry logic
    return await this.safeExec(async () => {
      // Attempt to connect to the server
      await this.connect();

      // Retrieve the list of mailboxes
      return await this.connection.list();
    });
  }

  async mailbox(id: string) {
    try {
      // Attempt to connect to the server
      try {
        await this.connect();
      } catch (error) {
        console.error(`Error connecting to mailbox: ${error.message}`);

        // If we can't reuse the ImapFlow instance, try to recreate it
        if (
          error.message &&
          (error.message.includes('Can not re-use ImapFlow instance') ||
            error.message === 'CONNECTION_NEEDS_RESET')
        ) {
          console.log('Recreating ImapFlow instance for mailbox access');
          delete sessions[this.accountId];
          await this.createSession();
          await this.connect(true);
        } else {
          throw error;
        }
      }

      // Decode the mailbox ID
      id = decodeURIComponent(id);

      // If the ID starts with '@', find the mailbox by special use property
      if (id.startsWith('@')) {
        // List all mailboxes
        const boxes = await this.mailboxList();

        // If no mailboxes found, return null
        if (!boxes) return null;

        // Find the mailbox with the special use property matching the ID
        id = boxes.find((a) => a.specialUse == `\\${id.slice(1)}`)?.path ?? '';
      }

      // Open the mailbox
      // Replace ':' with '/' in the mailbox ID
      // This is necessary because '/' would mess up the url
      const mbox = await this.safeExec(async () => {
        return await this.connection.mailboxOpen(
          decodeURIComponent(id).replace(/\:/gm, '/'),
        );
      });

      // If mailbox couldn't be opened, return null
      if (!mbox) return null;

      // Return mailbox functions
      return {
        // Function to list messages in the mailbox
        list: async (page: number = 1) => {
          return (
            (await this.safeExec(async () => {
              // Attempt to connect to the server
              await this.connect();

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
              const startMessage = Math.max(
                mbox.exists - perPage * page + 1,
                1,
              );
              const endMessage =
                page == 1 ? '*' : mbox.exists - perPage * (page - 1);
              const range = `${startMessage}:${endMessage}`;

              // Fetch the messages from the mailbox with retry logic
              let msgs;
              let fetchRetries = 0;
              const maxFetchRetries = 3;

              while (fetchRetries <= maxFetchRetries) {
                try {
                  msgs = await this.connection.fetch(range, {
                    envelope: true,
                    source: true,
                    flags: true,
                    headers: true,
                  });

                  break; // Exit the loop if fetch is successful
                } catch (error) {
                  fetchRetries++;
                  console.error(
                    `Fetch attempt ${fetchRetries} failed: ${error.message}`,
                  );

                  if (fetchRetries <= maxFetchRetries) {
                    // Wait before retry, increasing delay for each retry
                    const delayMs = 1000 * fetchRetries;
                    console.log(`Retrying fetch in ${delayMs}ms...`);
                    await new Promise((resolve) =>
                      setTimeout(resolve, delayMs),
                    );

                    // Try to reconnect before retrying
                    try {
                      await this.reconnect();
                      await this.connection.mailboxOpen(
                        decodeURIComponent(id).replace(/\:/gm, '/'),
                      );
                    } catch (reconnectError) {
                      console.error(
                        `Failed to reconnect: ${reconnectError.message}`,
                      );
                      // Attempt another reconnection with more delay
                      try {
                        await new Promise((resolve) =>
                          setTimeout(resolve, 2000),
                        );
                        await this.reconnect();
                        await this.connection.mailboxOpen(
                          decodeURIComponent(id).replace(/\:/gm, '/'),
                        );
                        console.log(
                          'Reconnection successful on second attempt',
                        );
                      } catch (secondReconnectError) {
                        console.error(
                          `Second reconnection attempt failed: ${secondReconnectError.message}`,
                        );
                        // Continue anyway, the next fetch attempt will fail gracefully
                      }
                    }
                  } else {
                    console.error(
                      `All fetch retries failed for range ${range}`,
                    );
                    // Try one final reconnect before giving up
                    try {
                      console.log('Attempting final reconnection...');
                      await new Promise((resolve) => setTimeout(resolve, 3000));
                      await this.reconnect();
                      await this.connection.mailboxOpen(
                        decodeURIComponent(id).replace(/\:/gm, '/'),
                      );
                      console.log(
                        'Final reconnection successful, but returning empty result for this fetch',
                      );
                    } catch (finalReconnectError) {
                      console.error(
                        `Final reconnection attempt failed: ${finalReconnectError.message}`,
                      );
                    }
                    // Return empty result instead of crashing
                    return {
                      data: [],
                      meta: {
                        page,
                        total: mesagesTotal,
                        totalPages: pages,
                        perPage,
                      },
                    };
                  }
                }
              }

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
                headers: {
                  [key: string]: any;
                };
                files: {
                  name: string;
                }[];
              }[] = [];

              // Iterate through the messages
              for await (const msg of msgs) {
                try {
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

                  // Create a headers object from the message headers
                  const headers = parseMailHeaders(
                    msg.headers.toString(),
                  ) as any;

                  // Parse internal headers
                  headers.internal = parseInternalHeaders(headers);

                  // Push the message data to the result array
                  result.push({
                    id: msg.uid?.toString() ?? '',
                    subject: data.subject ?? '',
                    sender: {
                      name: data.from?.name ?? '',
                      email: data.from?.address ?? '',
                    },
                    body:
                      preview.length < 1 ? (data.text ?? '') : (preview ?? ''),
                    date: msg.envelope?.date ?? new Date(0),
                    flags: flags,
                    headers: headers,
                    files:
                      data.attachments?.map((a) => ({
                        name: a.filename ?? '',
                      })) ?? [],
                  });
                } catch (error) {
                  console.error(`Error processing message: ${error.message}`);
                  // Continue to next message to prevent one bad message from breaking the list
                }
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
            })) || {
              data: [],
              meta: { page, total: 0, totalPages: 0, perPage: 0 },
            }
          );
        },
        // Function to get a specific message by ID
        message: async (id: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

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

            // If still no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
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
            const headers = parseMailHeaders(msg.headers.toString()) as any;

            // Parse internal headers
            headers.internal = parseInternalHeaders(headers);

            // Generate a preview of the message body by stripping HTML tags,
            // replacing new lines with spaces, and trimming the result
            const preview = convert(
              data.html && data.html.length > 0 ? data.html : (data.text ?? ''),
              {
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
              },
            )
              .replace(/[\n\r]/g, ' ')
              .trim()
              .substring(0, 120);

            // Return the message data
            return {
              id: msg.uid?.toString() ?? '',
              subject: data.subject ?? '',
              sender: {
                name: data.from?.name ?? '',
                email: data.from?.address ?? '',
              },
              flags,
              body:
                data.html && data.html.length > 0
                  ? data.html
                  : (data.text ?? ''),
              preview: preview.length < 1 ? (data.text ?? '') : (preview ?? ''),
              date: msg.envelope?.date ?? new Date(0),
              headers: headers,
              files:
                data.attachments?.map((a) => ({
                  name: a.filename ?? '',
                  id: a.contentId ?? '',
                  type: a.contentType?.type ?? '',
                  content:
                    typeof a.body == 'string'
                      ? a.body
                      : Buffer.from(a.body || '').toString('base64'),
                })) ?? [],
            };
          });
        },
        // Function to get the raw message source by ID
        rawMessage: async (id: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

            // Search for the message by ID
            const searchResults = await this.connection.search({
              uid: id,
            });

            // If no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
            }

            // Fetch the message source from the search results
            const msg = await this.connection.fetchOne(
              searchResults[0].toString(),
              {
                source: true,
              },
            );

            // Return the raw message source
            return msg.source.toString();
          });
        },
        // Function to add a flag to a message by ID
        addFlag: async (id: string, flag: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

            // Search for the message by ID
            const searchResults = await this.connection.search({
              uid: id,
            });

            // If no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
            }

            // Add the flag to the message
            await this.connection.messageFlagsAdd(searchResults[0].toString(), [
              flag,
            ]);

            // Return the message ID and flag
            return {
              id: searchResults[0].toString(),
              flag,
            };
          });
        },
        // Function to remove a flag from a message by ID
        removeFlag: async (id: string, flag: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

            // Search for the message by ID
            const searchResults = await this.connection.search({
              uid: id,
            });

            // If no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
            }

            // Remove the flag from the message
            await this.connection.messageFlagsRemove(
              searchResults[0].toString(),
              [flag],
            );

            // Return the message ID and flag
            return {
              id: searchResults[0].toString(),
              flag,
            };
          });
        },
        // Function to move a message to a different mailbox by ID
        move: async (id: string, destination: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

            // Search for the message by ID
            const searchResults = await this.connection.search({
              uid: id,
            });

            // If no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
            }

            // Move the message to the destination mailbox
            await this.connection.messageMove(
              searchResults[0].toString(),
              destination,
            );

            // Return the message ID
            return {
              id: searchResults[0].toString(),
            };
          });
        },
        delete: async (id: string) => {
          return await this.safeExec(async () => {
            // Attempt to connect to the server
            await this.connect();

            // Search for the message by ID
            const searchResults = await this.connection.search({
              uid: id,
            });

            // If no results, return null
            if (!searchResults || searchResults.length < 1) {
              return null;
            }

            // Delete the message from the mailbox
            await this.connection.messageDelete(searchResults[0].toString());

            // Return the message ID
            return {
              id: searchResults[0].toString(),
            };
          });
        },
      };
    } catch (error) {
      console.error(`Error accessing mailbox: ${error.message}`);
      return null;
    }
  }

  // Method to safely execute IMAP fetch operations with proper error handling
  private async safeFetch(
    range: string,
    options: any,
    id: string,
    retryCount: number = 0,
  ): Promise<any> {
    const maxRetries = 3;
    try {
      // Ensure we have a valid connection
      if (!this.connection.authenticated) {
        await this.reconnect();
        try {
          await this.connection.mailboxOpen(
            decodeURIComponent(id).replace(/\:/gm, '/'),
          );
        } catch (error) {
          console.error(
            `Failed to open mailbox after reconnect: ${error.message}`,
          );
        }
      }

      return await this.connection.fetch(range, options);
    } catch (error) {
      console.error(
        `Fetch operation failed (attempt ${retryCount + 1}): ${error.message}`,
      );

      if (retryCount < maxRetries) {
        // Exponential backoff delay
        const delayMs = 1000 * Math.pow(2, retryCount);
        console.log(`Retrying fetch in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        // Force reconnection for network errors
        if (
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNRESET' ||
          error.code === 'EPIPE' ||
          !this.connection.authenticated
        ) {
          try {
            await this.reconnect();
            await this.connection.mailboxOpen(
              decodeURIComponent(id).replace(/\:/gm, '/'),
            );
          } catch (reconnectError) {
            console.error(`Reconnection failed: ${reconnectError.message}`);
          }
        }

        // Recursive retry with incremented counter
        return this.safeFetch(range, options, id, retryCount + 1);
      }

      // If we've exhausted retries, return null to handle gracefully
      console.error(`All fetch retries exhausted for range ${range}`);
      return null;
    }
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
    try {
      return new this(conf);
    } catch (error) {
      console.error(`Failed to create IMAP instance: ${error.message}`);
      throw error;
    }
  }
}
