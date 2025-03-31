import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'mailserver',
})
export class MailServerEntity {
  @PrimaryColumn({
    length: 36,
  })
  id: string;

  @Column({
    length: 128,
  })
  imapAddress: string;

  @Column({
    length: 8,
  })
  imapPort: string;

  @Column({
    length: 128,
  })
  smtpAddress: string;

  @Column({
    length: 8,
  })
  smtpPort: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
