import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { IS_DEV, PUBLIC_WEB_URL } from 'src/config';
import { Repo } from 'src/db/_index';
import { UserEntity } from 'src/db/user.entity';
import { AutomatedMail, AutomatedMailType } from 'src/providers/mail/automated';
import { Imap } from 'src/providers/mail/imap';
import { sendDiscordWebhook } from 'src/providers/webhook/discord';
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

    const verificationMail = new AutomatedMail(
      AutomatedMailType.SignupVerification,
    );

    verificationMail.insertPlaceholders({
      name: name,
      verificationLink: `${process.env.NET_WEB_PUB}/auth/verify?code=${user.verificationCode}`,
      currentYear: new Date().getFullYear().toString(),
      termsUrl: `${process.env.NET_WEB_PUB}/terms`,
      privacyPolicyUrl: `${process.env.NET_WEB_PUB}/privacy`,
      logoUrl: `${PUBLIC_WEB_URL}/birdie_logo_text.png`,
    });

    await verificationMail.send(email);

    await sendDiscordWebhook(
      'Wohoooo! We have a new user! <@734854849157660692>' +
        (IS_DEV ? '\n-# Development mode' : ''),
    );

    return OkResponse({});
  }

  async verify(key: string) {
    if (!key) return;

    const user = await Repo.user.findOne({
      where: {
        verificationCode: key,
      },
    });
    if (!user)
      return ErrorResponse(
        'Invalid verification code (maybe already verified?)',
      );

    user.isVerified = true;
    user.verificationCode = '-';

    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));
    if ('error' in res) return ErrorResponse(res.error);

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
    imap_secure: boolean,
    smtp_host: string,
    smtp_port: number,
    smtp_secure: boolean,
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
      secure: imap_secure,
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
        imapSecure: imap_secure,
        smtpAddress: smtp_host,
        smtpPort: smtp_port.toString(),
        smtpSecure: smtp_secure,
      },
    });

    if (!mailServer) {
      mailServer = Repo.mailServer.create({
        id: randomUUID(),
        imapAddress: imap_host,
        imapPort: imap_port.toString(),
        imapSecure: imap_secure,
        smtpAddress: smtp_host,
        smtpPort: smtp_port.toString(),
        smtpSecure: smtp_secure,
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

  async getMailAccounts(user: UserEntity) {
    const mailAccounts = await Repo.mailAccount.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
    });

    return mailAccounts;
  }

  async resetPassword(email: string) {
    if (!isEmail(email)) return ErrorResponse('Invalid email address');

    const exists = await this.checkIfUserExists(email);
    if (!exists)
      return ErrorResponse(
        'User with this email does not exist, try signing up',
      );

    const user = await Repo.user.findOne({
      where: {
        email: email,
      },
    });
    if (!user) return ErrorResponse('User with this email does not exist');
    if (!user.isVerified)
      return ErrorResponse('Please verify your email first');

    const resetMail = new AutomatedMail(AutomatedMailType.PasswordReset);

    user.verificationCode = randomUUID().replace(/-/g, '');

    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));
    if ('error' in res) return ErrorResponse(res.error);

    resetMail.insertPlaceholders({
      name: user.name,
      resetLink: `${process.env.NET_WEB_PUB}/auth/reset?code=${user.verificationCode}`,
      currentYear: new Date().getFullYear().toString(),
      termsUrl: `${process.env.NET_WEB_PUB}/terms`,
      privacyPolicyUrl: `${process.env.NET_WEB_PUB}/privacy`,
      logoUrl: `${PUBLIC_WEB_URL}/birdie_logo_text.png`,
    });

    await resetMail.send(email);

    return OkResponse({});
  }

  async finishResetPassword(code: string, password: string) {
    if (!code) return ErrorResponse('Invalid code');
    if (!isStrongPassword(password))
      return ErrorResponse('Password is not strong enough');

    const user = await Repo.user.findOne({
      where: {
        verificationCode: code,
      },
    });
    if (!user)
      return ErrorResponse(
        'Invalid verification code (maybe already verified?)',
      );

    user.password = hashSync(password, 12);
    user.verificationCode = '-';

    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));
    if ('error' in res) return ErrorResponse(res.error);

    return OkResponse({});
  }

  async userInfo(user: UserEntity) {
    if (!user) return ErrorResponse('User not found');

    return OkResponse(user);
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
