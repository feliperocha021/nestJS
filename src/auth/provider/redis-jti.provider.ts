import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

/* Estruturas salvas no Redis
Strings:
jti:abc123 → "42"
jti:def456 → "42"
jti:ghi789 → "42"

Set:
user_jtis:42 → {abc123, def456, ghi789} */

@Injectable()
export class RedisJtiProvider {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  // Adiciona um novo JTI no set do usuário
  async addJti(userId: string, jti: string, ttlSeconds: number) {
    await this.redisClient.setex(`jti:${jti}`, ttlSeconds, userId);
    await this.redisClient.sadd(`user_jtis:${userId}`, jti);
    await this.redisClient.expire(`user_jtis:${userId}`, ttlSeconds);
  }

  // Verifica se o JTI está válido (existe no Redis)
  async isValidJti(userId: string, jti: string): Promise<boolean> {
    const stored = await this.redisClient.get(`jti:${jti}`);
    return stored === userId;
  }

  // Remove um JTI específico em logout de usuário ou endpoint refresh token
  async removeJti(userId: string, jti: string) {
    await this.redisClient.del(`jti:${jti}`);
    await this.redisClient.srem(`user_jtis:${userId}`, jti);
  }

  // Remove um JTIs já expirados de um usuário
  async cleanupExpiredJtis(userId: string) {
    // Busca todos os JTIs associados ao usuário
    const jtis = await this.redisClient.smembers(`user_jtis:${userId}`);
    if (!jtis.length) return;

    // Monta um pipeline para verificar a existência de cada jti:<uuid>
    const pipeline = this.redisClient.pipeline();
    jtis.forEach((jti) => {
      pipeline.exists(`jti:${jti}`);
    });

    const results = await pipeline.exec();
    if (!results) return;

    // Filtra os JTIs cujo valor correspondente jti:<uuid> não existe mais
    const expiredJtis = jtis.filter((_, i) => {
      const res = results[i];
      return Array.isArray(res) && res[0] === null && res[1] === 0;
    });

    if (!expiredJtis.length) return;

    // Remove os JTIs expirados do set do usuário
    const removalPipeline = this.redisClient.pipeline();
    removalPipeline.srem(`user_jtis:${userId}`, ...expiredJtis);
    await removalPipeline.exec();
  }

  // Remove todos os JTIs de um usuário
  async clearAllJtis(userId: string) {
    const allJtis = await this.redisClient.smembers(`user_jtis:${userId}`);
    if (allJtis.length) {
      const pipeline = this.redisClient.pipeline();
      allJtis.forEach((jti) => {
        pipeline.del(`jti:${jti}`);
        pipeline.srem(`user_jtis:${userId}`, jti);
      });
      pipeline.del(`user_jtis:${userId}`);
      await pipeline.exec();
    }
  }
}

/*
  // { member: 'abc123', score: 1712345678901 },
  // { member: 'def456', score: 1712345678901 },
  // { member: 'ghi789', score: 1712345678901 }
  // 1. Armazena JTI com score = timestamp de expiração
  async addJti(userId: string, jti: string, ttlSeconds: number) {
    const expireAt = Date.now() + ttlSeconds * 1000;
    await this.redisClient.zadd(`user_jtis:${userId}`, expireAt, jti);
  }

  // 2. Verifica se JTI existe e ainda não expirou
  async isValidJti(userId: string, jti: string): Promise<boolean> {
    // Primeiro, limpa expirados
    await this.cleanupExpiredJtis(userId);

    // Checa presença
    const score = await this.redisClient.zscore(`user_jtis:${userId}`, jti);
    return score !== null;
  }

  // 3. Remove JTI usado ou em logout
  async removeJti(userId: string, jti: string) {
    await this.redisClient.zrem(`user_jtis:${userId}`, jti);
  }

  // 4. Limpa todos os JTIs cujo score <= now
  async cleanupExpiredJtis(userId: string) {
    const now = Date.now();
    // Remove todos os membros expirados
    await this.redisClient.zremrangebyscore(
      `user_jtis:${userId}`,
      0,
      now,
    );
  }

  // 5. Revoga todos os JTIs de um usuário
  async clearAllJtis(userId: string) {
    await this.redisClient.del(`user_jtis:${userId}`);
  }
}

Quando migrar para Sorted Sets
Se você espera milhares de refresh tokens por usuário.

Quando a limpeza periódica dos tokens expirados começa a impactar a latência.

Para tornar o ciclo de vida do token totalmente gerenciado dentro de um único key. */
