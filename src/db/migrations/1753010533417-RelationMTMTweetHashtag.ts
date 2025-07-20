import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationMTMTweetHashtag1753010533417 implements MigrationInterface {
    name = 'RelationMTMTweetHashtag1753010533417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hashtag" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_347fec870eafea7b26c8a73bac1" UNIQUE ("name"), CONSTRAINT "PK_cb36eb8af8412bfa978f1165d78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tweet_hashtags_hashtag" ("tweetId" integer NOT NULL, "hashtagId" integer NOT NULL, CONSTRAINT "PK_8fe882a39e40497b6aa7e2b1bea" PRIMARY KEY ("tweetId", "hashtagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9d676e307309893940ea489b8a" ON "tweet_hashtags_hashtag" ("tweetId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e567cf4159f79b9f48e649dc73" ON "tweet_hashtags_hashtag" ("hashtagId") `);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum" RENAME TO "profile_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum" USING "gender"::"text"::"public"."profile_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" ADD CONSTRAINT "FK_9d676e307309893940ea489b8a0" FOREIGN KEY ("tweetId") REFERENCES "tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" ADD CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c" FOREIGN KEY ("hashtagId") REFERENCES "hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" DROP CONSTRAINT "FK_e567cf4159f79b9f48e649dc73c"`);
        await queryRunner.query(`ALTER TABLE "tweet_hashtags_hashtag" DROP CONSTRAINT "FK_9d676e307309893940ea489b8a0"`);
        await queryRunner.query(`CREATE TYPE "public"."profile_gender_enum_old" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "profile" ALTER COLUMN "gender" TYPE "public"."profile_gender_enum_old" USING "gender"::"text"::"public"."profile_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."profile_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."profile_gender_enum_old" RENAME TO "profile_gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e567cf4159f79b9f48e649dc73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d676e307309893940ea489b8a"`);
        await queryRunner.query(`DROP TABLE "tweet_hashtags_hashtag"`);
        await queryRunner.query(`DROP TABLE "hashtag"`);
    }

}
