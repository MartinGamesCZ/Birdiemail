import { Repo } from 'src/db/_index';
import { Permission } from 'src/types/user/permission';

// Function to get all permissions for a user
export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  // Fetch permissions from the database
  const perms = await Repo.permission.find({
    where: {
      user: {
        id: userId,
      },
    },
  });

  // Map the permissions to the Permission type
  return perms.map((p) => p.permission as Permission);
}

// Function to check if a user has a specific permission
export async function hasPermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  // Fetch all permissions for the user
  const perms = await getUserPermissions(userId);

  // Check if the user has the specific permission
  return perms.includes(permission);
}
