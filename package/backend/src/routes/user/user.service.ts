import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { IS_DEV, PUBLIC_WEB_URL } from 'src/config';
import { Repo } from 'src/db/_index';
import { UserEntity } from 'src/db/user.entity';
import { AutomatedMail } from 'src/providers/mail/automated';
import { Imap } from 'src/providers/mail/imap';
import { Smtp } from 'src/providers/mail/smtp';
import { sendDiscordWebhook } from 'src/providers/webhook/discord';
import { AutomatedMailType } from 'src/types/mail/automated';
import { Response } from 'src/types/response/_index';
import { getCurrentYear } from 'src/utils/datetime';
import {
  createUserToken,
  decodeUserToken,
  decryptMailPassword,
  encryptMailPassword,
  getMailPasswordEncryptionKey,
} from 'src/utils/encryption';
import { ErrorResponse, OkResponse } from 'src/utils/response';
import { isEmail, isPort, isStrongPassword } from 'validator';
import { getTosUrl, getLogoUrl, getPrivacyUrl } from 'src/utils/web/urldef';

// Service for handling user-related functionality
@Injectable()
export class UserService {
  // Function to sign up a new user
  async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<Response<{}>> {
    // Check if the email is valid
    if (!isEmail(email)) return ErrorResponse('Invalid email address');

    // Check if the password is strong enough
    if (!isStrongPassword(password))
      return ErrorResponse('Password is not strong enough');

    // Check if the name is valid
    if (!name || name.length < 3 || name.length > 128)
      return ErrorResponse('Invalid name');

    // Return error if the email is already in use
    const exists = await this.checkIfUserExists(email);
    if (exists)
      return ErrorResponse(
        'User with this email already exists, try signing in',
      );

    // Create a new user entity
    const user = Repo.user.create({
      id: randomUUID(), // Generate a random UUID
      name: name,
      email: email,
      password: hashSync(password, 12), // Hash the password using bcrypt, 12 rounds
      hash: randomUUID().replace(/-/g, ''), // Generate a random hash for the user
      verificationCode: randomUUID().replace(/-/g, ''), // Generate a random verification code
    });

    // Save the user to the database and handle any errors
    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    // Return in case of error
    if ('error' in res) return ErrorResponse(res.error);

    // Create a new verification mail
    const verificationMail = new AutomatedMail(
      AutomatedMailType.SignupVerification,
    );

    // Insert placeholders into the mail template
    verificationMail.insertPlaceholders({
      name: name,
      verificationLink: `${process.env.NET_WEB_PUB}/auth/verify?code=${user.verificationCode}`,
      currentYear: getCurrentYear().toString(),
      termsUrl: getTosUrl(),
      privacyPolicyUrl: getPrivacyUrl(),
      logoUrl: getLogoUrl(),
    });

    // Send the verification mail to the user
    await verificationMail.send(
      email,
      'Birdiemail - Verify your email address',
    );

    // Send a Discord webhook notification about the new user (so we can open the champagne)
    await sendDiscordWebhook(
      'Wohoooo! We have a new user! <@734854849157660692>' + // Ping me
        (IS_DEV ? '\n-# Development mode' : ''), // Add dev mode info
    );

    // Return success response
    return OkResponse({});
  }

  // Function to verify the user's email address
  async verify(key: string) {
    // Check if the verification key is valid
    if (!key) return;

    // Find the user with the given verification code
    const user = await Repo.user.findOne({
      where: {
        verificationCode: key,
      },
    });

    // Return error if user not found
    if (!user)
      return ErrorResponse(
        'Invalid verification code (maybe already verified?)',
      );

    // Update users properties
    user.isVerified = true;
    user.verificationCode = '-';

    // Save the changes to the repository and handle any errors
    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in res) return ErrorResponse(res.error);

    // Return success response
    return OkResponse({});
  }

  // Function to sign in an existing user
  async signin(
    email: string,
    password: string,
  ): Promise<
    Response<{
      token: string;
      encryptionKey: string;
    }>
  > {
    // Check if the email and password are valid
    if (!isEmail(email)) return ErrorResponse('Invalid email address');
    if (!password) return ErrorResponse('Invalid password');

    // Check if the user exists
    const exists = await this.checkIfUserExists(email);

    // Return error if user does not exist
    if (!exists)
      return ErrorResponse(
        'User with this email does not exist, try signing up',
      );

    // Get the user from the database including secret fields
    const user = await Repo.user.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'password', 'isVerified', 'hash'],
    });

    // Return error if user not found
    if (!user) return ErrorResponse('User with this email does not exist');

    // Return error if user is not verified
    if (!user.isVerified)
      return ErrorResponse('User is not verified, check your email');

    // Check if the password is correct
    // Return error if password is incorrect
    const passwordsMatch = compareSync(password, user.password);
    if (!passwordsMatch) return ErrorResponse('Invalid password');

    // Generate a new jwt token for the user with needed data
    const token = createUserToken(user.id, user.hash);

    // Return error if token generation failed
    if (!token) return ErrorResponse('Failed to create token');

    // TODO: Record user login for auditing and security purposes

    // Obtain the encryption key for the user
    // Client will save this to decrypt the mail passwords later
    const encryptionKey = getMailPasswordEncryptionKey(user.id, password);

    // Return success response with the data
    return OkResponse({
      token: token,
      encryptionKey: encryptionKey,
    });
  }

  // Function to add a new mail account for the user
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
    // Check if the name is valid
    if (!name || name.length < 3 || name.length > 128)
      return ErrorResponse('Invalid name');

    // Check if the email is valid
    if (!isEmail(email)) return ErrorResponse('Invalid email address');

    // Check if the password is valid
    if (!password) return ErrorResponse('Invalid password');

    // Check if the IMAP and SMTP ports are valid
    if (!isPort(imap_port.toString()))
      return ErrorResponse('Invalid IMAP port');
    if (!isPort(smtp_port.toString()))
      return ErrorResponse('Invalid SMTP port');

    // Check if the IMAP and SMTP server addresses are valid
    if (!imap_host || imap_host.length < 3 || imap_host.length > 128)
      return ErrorResponse('Invalid IMAP host');
    if (!smtp_host || smtp_host.length < 3 || smtp_host.length > 128)
      return ErrorResponse('Invalid SMTP host');

    // Try to connect to the IMAP server with the provided credentials
    // to check if they are valid
    const imap = await Imap.connect({
      host: imap_host,
      port: imap_port.toString(),
      secure: imap_secure,
      user: email,
      password: password,
      accountId: '@connection_test' + randomUUID(),
    }).catch((e) => '@err');

    // Return error if the IMAP connection failed (probably invalid credentials)
    if (typeof imap == 'string')
      return ErrorResponse('Invalid IMAP credentials');

    await imap.disconnect();

    // Try to connect to the SMTP server with the provided credentials
    // to check if they are valid
    const smtp = await Smtp.connect({
      host: smtp_host,
      port: smtp_port.toString(),
      secure: smtp_secure,
      user: email,
      password: password,
    }).catch((e) => '@err');

    // Return error if the SMTP connection failed (probably invalid credentials)
    if (typeof smtp == 'string' || (await smtp.isAuthenticated()) == false)
      return ErrorResponse('Invalid SMTP credentials');

    // Check if the mailserver is already in the database
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

    // If the mailserver is not in the database, create a new one
    if (!mailServer) {
      // Create a new mail server entity
      mailServer = Repo.mailServer.create({
        id: randomUUID(),
        imapAddress: imap_host,
        imapPort: imap_port.toString(),
        imapSecure: imap_secure,
        smtpAddress: smtp_host,
        smtpPort: smtp_port.toString(),
        smtpSecure: smtp_secure,
      });

      // Save the mail server to the database and handle any errors
      const data = await Repo.mailServer.save(mailServer).catch((e) => ({
        error: e.message,
      }));

      // Return error if saving failed
      if ('error' in data) return ErrorResponse(data.error);
    }

    // Check if the mail account already exists for the user
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

    // Return error if the mail account already exists
    if (mailAccountExists) return ErrorResponse('Mail account already added');

    // Create a new mail account entity
    const mailAccount = Repo.mailAccount.create({
      id: randomUUID(),
      name: name,
      email: email,
      password: encryptMailPassword(encryptionKey, password),
      user: user,
      mailServer: mailServer,
    });

    // Save the mail account to the database and handle any errors
    const data = await Repo.mailAccount.save(mailAccount).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in data) return ErrorResponse(data.error);

    // Return ok response with the data
    return OkResponse({
      id: data.id,
    });
  }

  // Function to get all mail accounts for the user
  async getMailAccounts(user: UserEntity) {
    // Get all mail accounts for the user from the repository
    // Include the mail server relation to get the server details
    const mailAccounts = await Repo.mailAccount.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['mailServer'],
    });

    // Return all mail accounts
    return mailAccounts;
  }

  // Function to request a password reset
  async resetPassword(email: string) {
    // Check if the email is valid
    if (!isEmail(email)) return ErrorResponse('Invalid email address');

    // Check if the user exists
    const exists = await this.checkIfUserExists(email);

    // Return error if user does not exist
    if (!exists)
      return ErrorResponse(
        'User with this email does not exist, try signing up',
      );

    // Get the user from the database
    const user = await Repo.user.findOne({
      where: {
        email: email,
      },
    });

    // Return error if user not found or not verified
    if (!user) return ErrorResponse('User with this email does not exist');
    if (!user.isVerified)
      return ErrorResponse('Please verify your email first');

    // Create a new password reset mail
    const resetMail = new AutomatedMail(AutomatedMailType.PasswordReset);

    // Generate a new verification code for the user
    user.verificationCode = randomUUID().replace(/-/g, '');

    // Save the user to the database and handle any errors
    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in res) return ErrorResponse(res.error);

    // Insert placeholders into the mail template
    resetMail.insertPlaceholders({
      name: user.name,
      resetLink: `${process.env.NET_WEB_PUB}/auth/reset?code=${user.verificationCode}`,
      currentYear: getCurrentYear().toString(),
      termsUrl: getTosUrl(),
      privacyPolicyUrl: getPrivacyUrl(),
      logoUrl: getLogoUrl(),
    });

    // Send the password reset mail to the user
    await resetMail.send(email, 'Birdiemail - Reset your password');

    // Return success response
    return OkResponse({});
  }

  // Function to finish the password reset process
  async finishResetPassword(code: string, password: string) {
    // Check if the code is valid
    if (!code) return ErrorResponse('Invalid code');

    // Check if the password is strong enough
    if (!isStrongPassword(password))
      return ErrorResponse('Password is not strong enough');

    // Find the user with the given verification code
    const user = await Repo.user.findOne({
      where: {
        verificationCode: code,
      },
    });

    // Return error if user not found
    if (!user)
      return ErrorResponse(
        'Invalid verification code (maybe already verified?)',
      );

    // Update user properties
    user.password = hashSync(password, 12);
    user.verificationCode = '-';

    // Save the changes to the repository and handle any errors
    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in res) return ErrorResponse(res.error);

    // Return success response
    return OkResponse({});
  }

  // Function to get user information
  async userInfo(user: UserEntity) {
    // Check if the user is valid
    if (!user) return ErrorResponse('User not found');

    // Return user information
    return OkResponse(user);
  }

  // Function to update mail account details
  async updateMailAccount(user: UserEntity, accountId: string, name: string) {
    // Check if the name is valid
    if (!name || name.length < 3 || name.length > 128)
      return ErrorResponse('Invalid name');

    // Check if the user is valid
    if (!user) return ErrorResponse('User not found');

    // Check if the mail account exists
    const mailAccount = await Repo.mailAccount.findOne({
      where: {
        id: accountId,
        user: {
          id: user.id,
        },
      },
    });

    // Return error if mail account not found
    if (!mailAccount) return ErrorResponse('Mail account not found');

    // Update the mail account details
    mailAccount.name = name;
    mailAccount.updatedAt = new Date();

    // Save the changes to the repository and handle any errors
    const res = await Repo.mailAccount.save(mailAccount).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in res) return ErrorResponse(res.error);

    // Return success response
    return OkResponse({
      id: res.id,
    });
  }

  // Function for changing users password
  async changePassword(
    user: UserEntity,
    oldPassword: string,
    newPassword: string,
  ) {
    // Check if the password is strong enough
    if (!isStrongPassword(newPassword))
      return ErrorResponse('Password is not strong enough');
    if (!oldPassword) return ErrorResponse('Invalid password');

    // Check if the user is valid
    if (!user) return ErrorResponse('User not found');

    // Get users password
    const userData = await Repo.user.findOne({
      where: {
        id: user.id,
      },
      select: ['password'],
    });

    // Return error if user not found
    if (!userData) return ErrorResponse('User not found');

    // Check if the old password is correct
    const passwordsMatch = compareSync(oldPassword, userData.password);

    // Return error if passwords do not match
    if (!passwordsMatch) return ErrorResponse('Invalid current password');

    // Update the user's password
    user.password = hashSync(newPassword, 12);
    user.updatedAt = new Date();
    user.hash = randomUUID().replace(/-/g, ''); // Generate a new hash for the user

    // Save the changes to the repository and handle any errors
    const res = await Repo.user.save(user).catch((e) => ({
      error: e.message,
    }));

    // Return error if saving failed
    if ('error' in res) return ErrorResponse(res.error);

    // Derive new and old encryption keys
    const newEncryptionKey = getMailPasswordEncryptionKey(user.id, newPassword);
    const oldEncryptionKey = getMailPasswordEncryptionKey(user.id, oldPassword);

    // Re-encrypt the mail passwords
    await this.reEncryptMailPasswords(user, oldEncryptionKey, newEncryptionKey);

    // Generate a new jwt token and encryption key for the user
    const session = await this.signin(user.email, newPassword);

    console.log(session);

    // Return new session data
    return session;
  }

  // Function to re-encrypt mail passwords
  private async reEncryptMailPasswords(
    user: UserEntity,
    encryptionKey: string,
    newEncryptionKey: string,
  ) {
    // Get all mail accounts for the user
    const mailAccounts = await Repo.mailAccount.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    // Loop through each mail account and re-encrypt the password
    for (const account of mailAccounts) {
      const mailAccountDetails = await Repo.mailAccount.findOne({
        where: {
          id: account.id,
        },
        select: ['password'],
      });

      if (!mailAccountDetails) continue;

      const decrypted = decryptMailPassword(
        encryptionKey,
        mailAccountDetails.password,
      );

      account.password = encryptMailPassword(newEncryptionKey, decrypted);

      console.log(decrypted);

      await Repo.mailAccount.save(account);
    }
  }

  // Function to check if a user exists by email
  private async checkIfUserExists(email: string): Promise<boolean> {
    // Check if the email is valid
    if (!isEmail(email)) return false;

    // Check if the user exists in the database
    return await Repo.user.exists({
      where: {
        email: email,
      },
    });
  }

  // Function to get a user by token
  public async getUserByToken(token: string) {
    // Decode the user token
    const data = decodeUserToken(token);

    // Check if the token is valid
    if (!data) return null;
    if (!data.id) return null;

    // Check if the user exists in the database
    const user = await Repo.user.findOne({
      where: {
        id: data.id,
      },
    });

    // Return null if user not found or token does not match
    if (!user) return null;
    if (data.type != 'auth.user') return null;
    if (data.id != user.id) return null;
    if (data.hash != user.hash) return null;

    // Return the user object
    return user;
  }
}
