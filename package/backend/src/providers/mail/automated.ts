import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
import { Smtp } from './smtp';

export enum AutomatedMailType {
  SignupVerification = 'signup-verification',
}

export class AutomatedMail {
  template: AutomatedMailType;
  body: string;

  constructor(template: AutomatedMailType) {
    this.template = template;

    this.body = readFileSync(
      path.join(process.cwd(), 'src/assets/templates/mail', `${template}.hbs`),
      'utf-8',
    );
  }

  insertPlaceholders(placeholders: Record<string, string>) {
    this.body = Handlebars.compile(this.body)(placeholders);
  }

  async send(to: string) {
    const connection = new Smtp({
      host: process.env.MAILACC_CMN_SMTP_HOST ?? '',
      port: process.env.MAILACC_CMN_SMTP_PORT ?? '587',
      secure: process.env.MAILACC_CMN_SMTP_SECURE === 'true',
      user: process.env.MAILACC_NOREPLY_EMAIL ?? '',
      password: process.env.MAILACC_NOREPLY_PASSWORD ?? '',
    });

    await connection.connect();

    return await connection.send({
      from: `"Birdiemail" <${process.env.MAILACC_NOREPLY_EMAIL}>`,
      to,
      subject: 'Birdiemail - Verify your email address',
      body: this.body,
    });
  }
}
