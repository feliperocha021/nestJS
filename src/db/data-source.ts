import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../user/user.entity';
import * as dotenv from 'dotenv';
import { Profile } from 'src/profile/profile.entity';
import { Tweet } from 'src/tweet/tweet.entity';
import { Hashtag } from 'src/hashtag/hashtag.entity';

const ENV = process.env.NODE_ENV;
const envPath = ENV ? `.env.${ENV.trim()}.local` : '.env';
dotenv.config({ path: envPath });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,
  entities: [User, Profile, Tweet, Hashtag],
  migrations: ['dist/src/db/migrations/*.js'],
  synchronize: false,
  extra: {
    application_name: 'nest-migrations-app',
  },
};

export const dataSource = new DataSource(dataSourceOptions);
