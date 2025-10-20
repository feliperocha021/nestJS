import { Injectable, Inject, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(RedisJtiProvider.name);

  private static readonly JTI_KEY_PREFIX = 'jti';
  private static readonly USER_JTIS_KEY_PREFIX = 'user_jtis';

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  // Adiciona um novo JTI e associa ao usuário
  // Cada JTI expira individualmente, mas o set de JTIs do usuário é persistente.
  async addJti(userId: string, jti: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisClient.setex(this.buildJtiKey(jti), ttlSeconds, userId);
      await this.redisClient.sadd(this.buildUserJtisKey(userId), jti);
    } catch (error) {
      this.logger.error(`Error adding JTI for user ${userId}`);
      throw error;
    }
  }

  // Verifica se o JTI está válido (existe no Redis e pertence ao usuário)
  async isValidJti(userId: string, jti: string): Promise<boolean> {
    try {
      const storedUserId = await this.redisClient.get(this.buildJtiKey(jti));
      return storedUserId === userId;
    } catch (error) {
      this.logger.error(
        `Error validating JTI ${jti} for user ${userId}`,
        error,
      );
      return false;
    }
  }

  // Remove um JTI específico em logout de usuário ou endpoint refresh token
  async removeJti(userId: string, jti: string): Promise<void> {
    try {
      const pipeline = this.redisClient.pipeline();
      pipeline.del(this.buildJtiKey(jti));
      pipeline.srem(this.buildUserJtisKey(userId), jti);
      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error removing JTI ${jti} from user ${userId}`, error);
      throw error;
    }
  }

  // Remove JTIs já expirados do set do usuário.
  async cleanupExpiredJtis(userId: string): Promise<void> {
    try {
      const jtis = await this.redisClient.smembers(
        this.buildUserJtisKey(userId),
      );
      if (!jtis.length) return;

      const pipeline = this.redisClient.pipeline();
      jtis.forEach((jti) => pipeline.exists(this.buildJtiKey(jti)));
      const results = await pipeline.exec();

      const expiredJtis = jtis.filter((_, i) => results?.[i]?.[1] === 0);
      if (expiredJtis.length) {
        await this.redisClient.srem(
          this.buildUserJtisKey(userId),
          ...expiredJtis,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error while clearing expired JTIs for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  // Remove todos os JTIs de um usuário (logout global)
  async clearAllJtis(userId: string): Promise<void> {
    try {
      const jtis = await this.redisClient.smembers(
        this.buildUserJtisKey(userId),
      );
      if (!jtis.length) return;

      const pipeline = this.redisClient.pipeline();
      jtis.forEach((jti) => pipeline.del(this.buildJtiKey(jti)));
      pipeline.del(this.buildUserJtisKey(userId));
      await pipeline.exec();
    } catch (error) {
      this.logger.error(
        `Error while clearing all JTIs for user ${userId}`,
        error,
      );
    }
  }

  // Helpers para padronizar as chaves
  private buildJtiKey(jti: string): string {
    return `${RedisJtiProvider.JTI_KEY_PREFIX}:${jti}`;
  }

  private buildUserJtisKey(userId: string): string {
    return `${RedisJtiProvider.USER_JTIS_KEY_PREFIX}:${userId}`;
  }
}
