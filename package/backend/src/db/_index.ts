import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';
import { MailAccountEntity } from './mailaccount.entity';
import { MailServerEntity } from './mailserver.entity';
import { PermissionEntity } from './permission.entity';

export const Db = new DataSource({
  type: 'postgres',
  host: process.env.BACKEND_DB_HOST,
  port: Number(process.env.BACKEND_DB_PORT),
  username: process.env.BACKEND_DB_USER,
  password: process.env.BACKEND_DB_PASSWORD,
  database: process.env.BACKEND_DB_NAME,
  synchronize: true,
  logging: false,
  entities: [UserEntity, MailAccountEntity, MailServerEntity, PermissionEntity],
});

export const Repo = {
  user: Db.getRepository(UserEntity),
  mailAccount: Db.getRepository(MailAccountEntity),
  mailServer: Db.getRepository(MailServerEntity),
  permission: Db.getRepository(PermissionEntity),
};
