import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TRPCModule } from 'nestjs-trpc';
import { AppRouter } from './app.router';
import { DevController } from '../dev.controller';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: '../web/src/server/schema',
    }),
  ],
  controllers: [AppController, DevController],
  providers: [AppService, AppRouter],
})
export class AppModule {}
