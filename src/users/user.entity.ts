import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn() // gera um novo id automaticamente com base no id anterior
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 20,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 30,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 16,
  })
  password: string;
}
