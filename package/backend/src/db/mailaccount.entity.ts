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

@Entity({
  name: 'mailaccount',
})
export class MailAccountEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => MailServerEntity, (ms) => ms.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  mailServer: MailServerEntity;

  @Column({ length: 128 })
  name: string;

  @Column({ length: 128 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
