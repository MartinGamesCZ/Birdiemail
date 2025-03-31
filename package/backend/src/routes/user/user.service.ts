import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repo } from 'src/db/_index';
import { Response } from 'src/types/response/_index';
import { createUserToken, decodeUserToken } from 'src/utils/encryption';
import { ErrorResponse, OkResponse } from 'src/utils/response';
import { isEmail, isStrongPassword } from 'validator';

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
