import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeTweetUser1754506103518 implements MigrationInterface {
    name = 'CascadeTweetUser1754506103518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP CONSTRAINT "FK_a9703cf826200a2d155c22eda96"`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum" RENAME TO "profile_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum" USING "gender"::"text"::"public"."profile_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tweet" ADD CONSTRAINT "FK_a9703cf826200a2d155c22eda96" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP CONSTRAINT "FK_a9703cf826200a2d155c22eda96"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum_old" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum_old" USING "gender"::"text"::"public"."profile_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum_old" RENAME TO "profile_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "tweet" ADD CONSTRAINT "FK_a9703cf826200a2d155c22eda96" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
