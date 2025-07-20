import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDeletedInHashtag1753024851729 implements MigrationInterface {
    name = 'AddColumnDeletedInHashtag1753024851729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" DROP CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c"`);
        await queryRunner.query(`ALTER TABLE "hashtag" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum" RENAME TO "profile_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum" USING "gender"::"text"::"public"."profile_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" ADD CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c" FOREIGN KEY ("hashtagId") REFERENCES "hashtag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" DROP CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum_old" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum_old" USING "gender"::"text"::"public"."profile_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum_old" RENAME TO "profile_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "hashtag" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" ADD CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c" FOREIGN KEY ("hashtagId") REFERENCES "hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
