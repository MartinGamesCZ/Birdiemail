import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entity representing a mail server configuration
@Entity({
  name: 'mailserver',
})
export class MailServerEntity {
  // Unique identifier for the mail server
  @PrimaryColumn({
    length: 36,
  })
  id: string;

  // Server address for IMAP protocol
  @Column({
    length: 128,
  })
  imapAddress: string;

  // Port number for IMAP protocol
  @Column({
    length: 8,
  })
  imapPort: string;

  // Boolean indicating if IMAP connection is secure (SSL/TLS)
  @Column()
  imapSecure: boolean;

  // Server address for SMTP protocol
  @Column({
    length: 128,
  })
  smtpAddress: string;

  // Port number for SMTP protocol
  @Column({
    length: 8,
  })
  smtpPort: string;

  // Boolean indicating if SMTP connection is SSL
  @Column()
  smtpSecure: boolean;

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
