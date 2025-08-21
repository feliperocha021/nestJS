import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/user/user.entity';
import { Profile } from '../../src/profile/profile.entity';
import { Tweet } from '../../src/tweet/tweet.entity';
import { Hashtag } from '../../src/hashtag/hashtag.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const worker = process.env.JEST_WORKER_ID || '1';
        const schema = `test_worker_${worker}`;
        //console.log(`[PostgresTestModule] Worker ${worker} → schema =`, schema);
        const opts: DataSourceOptions = {
          type: 'postgres',
          host: process.env.DB_HOST || 'postgres-test',
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USER || 'nestuser',
          password: process.env.DB_PASSWORD || 'nestpass',
          database: process.env.DB_DB || 'nestdb',
          schema,
          entities: [User, Profile, Tweet, Hashtag],
          synchronize: false,
          dropSchema: false,
          extra: {
            max: 1,
            keepAlive: false,
            application_name: `tests_${worker}`,
          },
        };
        // Cria conexão temporária só para criar o schema
        const tmpDs = new DataSource({ ...opts, synchronize: false });
        await tmpDs.initialize();
        await tmpDs.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        await tmpDs.destroy();

        // Agora habilita dropSchema e synchronize
        return { ...opts, synchronize: true, dropSchema: true };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class PostgresTestModule {}
