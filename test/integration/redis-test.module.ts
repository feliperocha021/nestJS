import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import redisConfig, { RedisConfig } from '../../src/auth/config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test.local',
    }),
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (cfg: RedisConfig) => {
        const worker = process.env.JEST_WORKER_ID || '1';
        const dbIndex = Number(worker) % 16; // até 16 DBs no Redis padrão
        const prefix = `test:${worker}:`;

        const client = new Redis({
          host: cfg.redisHost,
          port: cfg.redisPort,
          db: dbIndex,
          keyPrefix: prefix,
          lazyConnect: true, // não conecta até usar pela 1ª vez
          maxRetriesPerRequest: 0, // sem retries
          enableOfflineQueue: false, // sem fila offline
          retryStrategy: () => null, // sem reconexão automática
        });
        await client.connect();
        return client;
      },
      inject: [redisConfig.KEY],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisTestModule implements OnModuleDestroy {
  constructor(
    // Nest injeta o mesmo client que exportamos
    @Inject('REDIS_CLIENT') private readonly client: Redis,
  ) {}

  async onModuleDestroy() {
    await this.client.quit();
  }
}
