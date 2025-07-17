import { User } from 'src/users/user.entity';
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
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 30,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    enumName: 'profile_gender_enum',
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  profileImage: string;

  // relações
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
