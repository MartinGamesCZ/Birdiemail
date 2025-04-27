import { NestFactory } from '@nestjs/core';
import { AppModule } from './routes/app/app.module';
import { Db } from './db/_index';
import { json } from 'express';

// Main entry point for the application
async function bootstrap() {
  // Initialize the database connection and ORM
  await Db.initialize();

  // Create the main application module
  const app = await NestFactory.create(AppModule);

  // Configure the application
  app.use(json({ limit: '500mb' })); // Limit the request body size to 500mb
  app.enableCors('*'); // Enable CORS for all origins

  // Start the application
  await app.listen(process.env.PORT ?? 3000);
}

// Start the application
bootstrap();
