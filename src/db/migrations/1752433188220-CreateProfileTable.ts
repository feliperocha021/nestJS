import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfileTable1752433188220 implements MigrationInterface {
    name = 'CreateProfileTable1752433188220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "firstName" character varying(20), "lastName" character varying(30), "gender" "public"."profile_gender_enum", "dateOfBirth" TIMESTAMP, "bio" text, "profileImage" text, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
    }

}
