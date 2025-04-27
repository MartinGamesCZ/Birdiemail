import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entity representing a user account
@Entity({
  name: 'user',
})
export class UserEntity {
  // Unique identifier for the user
  @PrimaryColumn({ length: 36 })
  id: string;

  // User's first and last name or a nickname
  @Column({ length: 128 })
  name: string;

  // User's primary email address
  @Column({ length: 128 })
  email: string;

  // User's password, bcrypt hashed
  // Used for encryption key derivation (before hashing)
  @Column({ length: 255, select: false })
  password: string;

  // If the user has verified their email address
  @Column({ default: false })
  isVerified: boolean;

  // Verification code for email verification or password reset
  @Column({ length: 32 })
  verificationCode: string;

  // User hash for "Logout All" functionality and other security purposes
  @Column({ length: 32 })
  hash: string;

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
