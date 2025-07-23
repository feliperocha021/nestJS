import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHastPassword1753300768636 implements MigrationInterface {
  name = 'AddHastPassword1753300768636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ALTER COLUMN "password" TYPE character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ALTER COLUMN "password" TYPE character varying(16)
    `);
  }
}
