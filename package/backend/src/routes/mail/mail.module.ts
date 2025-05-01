import { Module } from '@nestjs/common';
import { MailRouter } from './mail.router';
import { MailService } from './mail.service';
import { dbEntities } from 'src/db/_index';
import { UserService } from '../user/user.service';

@Module({
  imports: [...dbEntities],
  controllers: [],
  providers: [MailService, MailRouter, UserService],
})
export class MailModule {}
