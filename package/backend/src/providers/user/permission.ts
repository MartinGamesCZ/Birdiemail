import { Repo } from 'src/db/_index';
import { Permission } from 'src/types/user/permission';

export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  const perms = await Repo.permission.find({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return perms.map((p) => p.permission as Permission);
}

export async function hasPermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const perms = await getUserPermissions(userId);

  return perms.includes(permission);
}
