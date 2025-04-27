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
import { MailServerEntity } from './mailserver.entity';

// Entity representing a mail account and its credentials
@Entity({
  name: 'mailaccount',
})
export class MailAccountEntity {
  // Unique identifier for the mail account
  @PrimaryColumn({ length: 36 })
  id: string;

  // Mail account owner, linked to the user entity
  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  // Mail server associated with the mail account, linked to the mail server entity
  @ManyToOne(() => MailServerEntity, (ms) => ms.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  mailServer: MailServerEntity;

  // Mail account name (usually the first and last name of the user)
  @Column({ length: 128 })
  name: string;

  // Mail account email address
  @Column({ length: 128 })
  email: string;

  // Mail account password, encrypted using the key derived from user password
  @Column({ length: 255, select: false })
  password: string;

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
