import { NestFactory } from '@nestjs/core';
import { AppModule } from './routes/app/app.module';
import { Db } from './db/_index';
import { json } from 'express';
import { AutomatedMail, AutomatedMailType } from './providers/mail/automated';
import { PUBLIC_WEB_URL } from './config';

async function bootstrap() {
  await Db.initialize();

  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '500mb' }));

  app.enableCors('*');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
