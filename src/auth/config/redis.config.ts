import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  redisHost: string;
  redisPort: number;
  redisUrl?: string;
}

export default registerAs<RedisConfig>('redis', () => ({
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisUrl: process.env.REDIS_URL,
}));
