import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TRPCModule } from 'nestjs-trpc';
import { AppRouter } from './app.router';
import { DevController } from '../dev.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: '../web/src/server/schema',
    }),
    UserModule,
  ],
  controllers: [DevController],
  providers: [AppService, AppRouter],
})
export class AppModule {}
