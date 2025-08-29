import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  firstName?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 30,
  })
  lastName?: string | null;

  @Column({
    type: 'enum',
    enum: Gender,
    enumName: 'profile_gender_enum',
    nullable: true,
  })
  gender?: Gender | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dateOfBirth?: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  profileImage?: string | null;

  // relações
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user?: User;
}
