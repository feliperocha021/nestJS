import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import * as dotenv from 'dotenv';
import { Profile } from 'src/profile/profile.entity';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT!,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Profile],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: false,
};

export const dataSource = new DataSource(dataSourceOptions);
