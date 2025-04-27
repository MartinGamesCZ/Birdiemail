import { Injectable } from '@nestjs/common';
import { Repo } from 'src/db/_index';
import { UserEntity } from 'src/db/user.entity';
import { hasPermission } from 'src/providers/user/permission';
import { Permission } from 'src/types/user/permission';

// Service for handling admin-related functionality
@Injectable()
export class AdminService {
  // Function to check if the user is authorized to access admin features
  async checkIfAuthorized(user: UserEntity) {
    // Check the user's permissions
    return await hasPermission(
      user.id,
      Permission.InternalAdminView, // Use the admin dashboard view permission
    );
  }

  // Function to list all users
  async listUsers() {
    // Get all users from the user repository
    return await Repo.user.find();
  }

  // Function to get statistics about the application
  async getStats() {
    // Get number of users from the user repository
    const users = await Repo.user.count();

    // Return the statistics
    return {
      users,
    };
  }
}
