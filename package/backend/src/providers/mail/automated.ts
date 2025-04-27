import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
import { Smtp } from './smtp';
import { AutomatedMailType } from 'src/types/mail/automated';

// Class to handle automated emails
export class AutomatedMail {
  template: AutomatedMailType;
  body: string;

  constructor(template: AutomatedMailType) {
    // Set the template type
    this.template = template;

    // Read the template file from the specified path
    this.body = readFileSync(
      path.join(process.cwd(), 'src/assets/templates/mail', `${template}.hbs`),
      'utf-8',
    );
  }

  // Method to insert placeholders into the email body
  insertPlaceholders(placeholders: Record<string, string>) {
    // Use handlebars to compile the template with the provided placeholders
    this.body = Handlebars.compile(this.body)(placeholders);
  }

  // Method to send the email
  async send(to: string, title: string) {
    // Create a new SMTP connection to our mail server
    const connection = new Smtp({
      host: process.env.MAILACC_CMN_SMTP_HOST ?? '',
      port: process.env.MAILACC_CMN_SMTP_PORT ?? '587',
      secure: process.env.MAILACC_CMN_SMTP_SECURE === 'true',
      user:
        process.env.MAILACC_NOREPLY_USERNAME ??
        process.env.MAILACC_NOREPLY_EMAIL ??
        '',
      password: process.env.MAILACC_NOREPLY_PASSWORD ?? '',
    });

    // Connect to the SMTP server
    await connection.connect();

    // Send the email using the SMTP connection
    return await connection.send({
      from: `"Birdiemail" <${process.env.MAILACC_NOREPLY_EMAIL}>`,
      to,
      subject: title,
      body: this.body,
    });
  }
}
