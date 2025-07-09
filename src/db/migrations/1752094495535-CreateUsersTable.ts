import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1752094495535 implements MigrationInterface {
    name = 'CreateUsersTable1752094495535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying(20) NOT NULL, "lastName" character varying(30) NOT NULL, "gender" character varying(20), "email" character varying(100), "password" character varying(16), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
