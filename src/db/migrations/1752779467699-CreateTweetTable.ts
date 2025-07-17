import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTweetTable1752779467699 implements MigrationInterface {
    name = 'CreateTweetTable1752779467699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tweet" ("id" SERIAL NOT NULL, "text" text NOT NULL, "image" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_6dbf0db81305f2c096871a585f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum" RENAME TO "profile_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum" USING "gender"::"text"::"public"."profile_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tweet" ADD CONSTRAINT "FK_a9703cf826200a2d155c22eda96" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP CONSTRAINT "FK_a9703cf826200a2d155c22eda96"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum_old" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum_old" USING "gender"::"text"::"public"."profile_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum_old" RENAME TO "profile_gender_enum"`);
        await queryRunner.query(`DROP TABLE "tweet"`);
    }

}
