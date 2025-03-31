import { Module } from '@nestjs/common';
import { UserRouter } from './user.router';
import { UserService } from './user.service';
import { AuthMiddleware } from '../auth.middleware';
import { AppContext } from '../app/app.context';

@Module({
  imports: [],
  controllers: [],
  providers: [UserService, UserRouter, AuthMiddleware, AppContext],
})
export class UserModule {}
