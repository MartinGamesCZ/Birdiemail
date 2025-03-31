import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repo } from 'src/db/_index';
import { UserEntity } from 'src/db/user.entity';
import { Imap } from 'src/providers/mail/imap';
import { Response } from 'src/types/response/_index';
import {
  createUserToken,
  decodeUserToken,
  encryptMailPassword,
  getMailPasswordEncryptionKey,
} from 'src/utils/encryption';
import { ErrorResponse, OkResponse } from 'src/utils/response';
import { isEmail, isPort, isStrongPassword } from 'validator';

@Injectable()
export class UserService {
  async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<Response<{}>> {
    if (!isEmail(email)) return ErrorResponse('Invalid email address');
    if (!isStrongPassword(password))
      return ErrorResponse('Password is not strong enough');
    if (!name || name.length < 3 || name.length > 128)
      return ErrorResponse('Invalid name');

    const exists = await this.checkIfUserExists(email);
    if (exists)
      return ErrorResponse(
        'User with this email already exists, try signing in',
      );

    const user = Repo.user.create({
      id: randomUUID(),
      name: name,
      email: email,
      password: hashSync(password, 12),
      hash: randomUUID().replace(/-/g, ''),
      verificationCode: randomUUID().replace(/-/g, ''),
    });

    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    if ('error' in res) return ErrorResponse(res.error);

    // TODO: Add email verification mail sender

    return OkResponse({});
  }

  async signin(
    email: string,
    password: string,
  ): Promise<
    Response<{
      token: string;
    }>
  > {
    if (!isEmail(email)) return ErrorResponse('Invalid email address');
    if (!password) return ErrorResponse('Invalid password');

    const exists = await this.checkIfUserExists(email);
    if (!exists)
      return ErrorResponse(
        'User with this email does not exist, try signing up',
      );

    const user = await Repo.user.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'password', 'isVerified', 'hash'],
    });
    if (!user) return ErrorResponse('User with this email does not exist');

    if (!user.isVerified)
      return ErrorResponse('User is not verified, check your email');

    const passwordsMatch = compareSync(password, user.password);
    if (!passwordsMatch) return ErrorResponse('Invalid password');

    const token = createUserToken(user.id, user.hash);
    if (!token) return ErrorResponse('Failed to create token');

    // TODO: Record user login

    return OkResponse({
      token: token,
      encryptionKey: getMailPasswordEncryptionKey(user.id, password),
    });
  }

  async addMailAccount(
    name: string,
    email: string,
    password: string,
    imap_host: string,
    imap_port: number,
    smtp_host: string,
    smtp_port: number,
    user: UserEntity,
    encryptionKey: string,
  ) {
    if (!name || name.length < 3 || name.length > 128)
      return ErrorResponse('Invalid name');
    if (!isEmail(email)) return ErrorResponse('Invalid email address');
    if (!password) return ErrorResponse('Invalid password');
    if (!isPort(imap_port.toString()))
      return ErrorResponse('Invalid IMAP port');
    if (!isPort(smtp_port.toString()))
      return ErrorResponse('Invalid SMTP port');
    if (!imap_host || imap_host.length < 3 || imap_host.length > 128)
      return ErrorResponse('Invalid IMAP host');
    if (!smtp_host || smtp_host.length < 3 || smtp_host.length > 128)
      return ErrorResponse('Invalid SMTP host');

    // Try if credentials are valid
    const imap = await Imap.connect({
      host: imap_host,
      port: imap_port.toString(),
      user: email,
      password: password,
    }).catch((e) => '@err');

    if (typeof imap == 'string' && imap == '@err')
      return ErrorResponse('Invalid IMAP credentials');

    // TODO: Add SMTP credentials check

    let mailServer = await Repo.mailServer.findOne({
      where: {
        imapAddress: imap_host,
        imapPort: imap_port.toString(),
        smtpAddress: smtp_host,
        smtpPort: smtp_port.toString(),
      },
    });

    if (!mailServer) {
      mailServer = Repo.mailServer.create({
        id: randomUUID(),
        imapAddress: imap_host,
        imapPort: imap_port.toString(),
        smtpAddress: smtp_host,
        smtpPort: smtp_port.toString(),
      });

      const data = await Repo.mailServer.save(mailServer).catch((e) => ({
        error: e.message,
      }));
      if ('error' in data) return ErrorResponse(data.error);
    }

    const mailAccountExists = await Repo.mailAccount.exists({
      where: {
        email: email,
        password: password,
        mailServer: {
          id: mailServer.id,
        },
        user: user,
      },
    });
    if (mailAccountExists) return ErrorResponse('Mail account already added');

    const mailAccount = Repo.mailAccount.create({
      id: randomUUID(),
      name: name,
      email: email,
      password: encryptMailPassword(encryptionKey, password),
      user: user,
      mailServer: mailServer,
    });

    const data = await Repo.mailAccount.save(mailAccount).catch((e) => ({
      error: e.message,
    }));
    if ('error' in data) return ErrorResponse(data.error);

    return OkResponse({
      id: data.id,
    });
  }

  private async checkIfUserExists(email: string): Promise<boolean> {
    if (!isEmail(email)) return false;

    return await Repo.user.exists({
      where: {
        email: email,
      },
    });
  }

  public async getUserByToken(token: string) {
    const data = decodeUserToken(token);
    if (!data) return null;
    if (!data.id) return null;

    const user = await Repo.user.findOne({
      where: {
        id: data.id,
      },
    });

    if (!user) return null;
    if (data.id != user.id) return null;
    if (data.hash != user.hash) return null;

    return user;
  }
}
