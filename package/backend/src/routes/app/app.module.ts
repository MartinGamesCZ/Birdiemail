import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TRPCModule } from 'nestjs-trpc';
import { AppRouter } from './app.router';
import { DevController } from '../dev.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AppContext } from './app.context';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    // Initialize TRPC module with auto schema generation
    // Uses app context
    TRPCModule.forRoot({
      autoSchemaFile: '../web/src/server/schema',
      context: AppContext,
    }),
    UserModule,
    MailModule,
    AdminModule,
  ],
  controllers: [DevController],
  providers: [AppService, AppRouter],
})
export class AppModule {}
