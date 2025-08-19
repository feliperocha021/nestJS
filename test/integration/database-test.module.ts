// test\integration\database-test.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/user/user.entity';
import { Profile } from '../../src/profile/profile.entity';
import { Tweet } from '../../src/tweet/tweet.entity';
import { Hashtag } from '../../src/hashtag/hashtag.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres-test',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'nestuser',
      password: process.env.DB_PASSWORD || 'nestpass',
      database: process.env.DB_DB || 'nestdb',
      entities: [User, Profile, Tweet, Hashtag],
      synchronize: true,
      dropSchema: true, // Alterado para true para limpar completamente entre os testes
      extra: {
        max: 1, // Limita o número de conexões
        keepAlive: false,
        idleTimeoutMillis: 200, // fecha conexões ociosas rapidamente
        connectionTimeoutMillis: 5000,
        application_name: 'profile-tests',
      },
      poolSize: 1, // Usa apenas uma conexão
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseTestModule {}
