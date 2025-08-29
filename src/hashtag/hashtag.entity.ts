import { Tweet } from 'src/tweet/tweet.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 100,
  })
  name: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // relações
  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags)
  tweets?: Tweet[];
}
