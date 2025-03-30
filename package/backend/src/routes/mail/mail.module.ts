import { Module } from '@nestjs/common';
import { MailRouter } from './mail.router';
import { MailService } from './mail.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MailService, MailRouter],
})
export class MailModule {}
