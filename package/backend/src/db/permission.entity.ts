import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

// Entity for storing granted user permissions
@Entity({
  name: 'permission',
})
export class PermissionEntity {
  // Unique identifier for the permission
  @PrimaryColumn()
  id: string;

  // Permission type
  @Column()
  permission: string;

  // User to whom the permission is granted, linked to the user entity
  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  // Creation date
  @CreateDateColumn()
  createdAt: Date;

  // Last update date
  @UpdateDateColumn()
  updatedAt: Date;

  // Deletion date (for soft delete)
  @DeleteDateColumn()
  deletedAt: Date | null;
}
