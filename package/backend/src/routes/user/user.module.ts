import { Module } from "@nestjs/common";
import { UserRouter } from "./user.router";
import { UserService } from "./user.service";

@Module({
  imports: [],
  controllers: [],
  providers: [UserService, UserRouter],  
})
export class UserModule {}