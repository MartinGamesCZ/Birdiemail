import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthMiddleware } from '../auth.middleware';
import { AppContext } from '../app/app.context';
import { AdminRouter } from './admin.router';
import { UserService } from '../user/user.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AdminRouter,
    AdminService,
    AuthMiddleware,
    AppContext,
    UserService,
  ],
})
export class AdminModule {}
