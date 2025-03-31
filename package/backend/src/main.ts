import { NestFactory } from '@nestjs/core';
import { AppModule } from './routes/app/app.module';
import { Db } from './db/_index';

async function bootstrap() {
  await Db.initialize();

  const app = await NestFactory.create(AppModule);

  app.enableCors('*');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
