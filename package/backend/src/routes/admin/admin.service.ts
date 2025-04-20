import { Injectable } from '@nestjs/common';
import { Repo } from 'src/db/_index';

@Injectable()
export class AdminService {
  async listUsers() {
    return await Repo.user.find();
  }

  async getStats() {
    const users = await Repo.user.count();

    return {
      users,
    };
  }
}
