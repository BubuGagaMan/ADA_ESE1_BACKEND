import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateMvpDb1774980568270 implements MigrationInterface {
    name = 'GenerateMvpDb1774980568270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profile_image_url" character varying, "suspended" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_metrics_sex_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TYPE "public"."user_metrics_activity_level_enum" AS ENUM('1.2', '1.375', '1.55', '1.725', '1.9')`);
        await queryRunner.query(`CREATE TABLE "user_metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "height" integer NOT NULL, "weight" double precision NOT NULL, "sex" "public"."user_metrics_sex_enum" NOT NULL, "dob" date NOT NULL, "activity_level" "public"."user_metrics_activity_level_enum" NOT NULL, "user_id" uuid, CONSTRAINT "REL_5496a36f94befd2cbf3a5eb456" UNIQUE ("user_id"), CONSTRAINT "PK_987f8bd3fd2015b1c617b06b1cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."diet_weight_goal_enum" AS ENUM('-4', '-3', '-2', '-1', '0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "diet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "calories" integer NOT NULL DEFAULT '0', "carbohydrates" integer NOT NULL DEFAULT '0', "proteins" integer NOT NULL DEFAULT '0', "fats" integer NOT NULL DEFAULT '0', "fiber" integer NOT NULL DEFAULT '0', "carbohydrate_lower_range" integer NOT NULL, "carbohydrate_upper_range" integer NOT NULL, "protein_lower_range" integer NOT NULL, "protein_upper_range" integer NOT NULL, "fat_lower_range" integer NOT NULL, "fat_upper_range" integer NOT NULL, "daily_calorie_target" integer NOT NULL, "weight_goal" "public"."diet_weight_goal_enum" NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_f9d0f2b67d1c9bcaa6736f4cebd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "carbohydrates" integer NOT NULL DEFAULT '0', "fiber" integer NOT NULL DEFAULT '0', "proteins" integer NOT NULL DEFAULT '0', "fats" integer NOT NULL DEFAULT '0', "calories" integer NOT NULL DEFAULT '0', "glycemic_load" integer NOT NULL DEFAULT '0', "diet_id" uuid NOT NULL, CONSTRAINT "PK_ada510a5aba19e6bb500f8f7817" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "food" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "carbohydrates" integer NOT NULL, "proteins" integer NOT NULL, "fats" integer NOT NULL, "calories" integer NOT NULL, "fiber" integer NOT NULL, "weight" integer NOT NULL, "glycemic_index" integer NOT NULL, CONSTRAINT "PK_26d12de4b6576ff08d30c281837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meal_food" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "weight" integer NOT NULL, "meal_id" uuid, "food_id" uuid, CONSTRAINT "PK_62fe79b96e5a318e8b07aa0fd37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_metrics" ADD CONSTRAINT "FK_5496a36f94befd2cbf3a5eb4560" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diet" ADD CONSTRAINT "FK_71841d765fb6b5e6b6caffa0821" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal" ADD CONSTRAINT "FK_a206522510689a99b04356e523d" FOREIGN KEY ("diet_id") REFERENCES "diet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_food" ADD CONSTRAINT "FK_7be73e7f565cd1417fc80335abf" FOREIGN KEY ("meal_id") REFERENCES "meal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_food" ADD CONSTRAINT "FK_2c180db4f8848b4855f855a4877" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "meal_food" DROP CONSTRAINT "FK_2c180db4f8848b4855f855a4877"`);
        await queryRunner.query(`ALTER TABLE "meal_food" DROP CONSTRAINT "FK_7be73e7f565cd1417fc80335abf"`);
        await queryRunner.query(`ALTER TABLE "meal" DROP CONSTRAINT "FK_a206522510689a99b04356e523d"`);
        await queryRunner.query(`ALTER TABLE "diet" DROP CONSTRAINT "FK_71841d765fb6b5e6b6caffa0821"`);
        await queryRunner.query(`ALTER TABLE "user_metrics" DROP CONSTRAINT "FK_5496a36f94befd2cbf3a5eb4560"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "meal_food"`);
        await queryRunner.query(`DROP TABLE "food"`);
        await queryRunner.query(`DROP TABLE "meal"`);
        await queryRunner.query(`DROP TABLE "permission"`);
        await queryRunner.query(`DROP TABLE "diet"`);
        await queryRunner.query(`DROP TYPE "public"."diet_weight_goal_enum"`);
        await queryRunner.query(`DROP TABLE "user_metrics"`);
        await queryRunner.query(`DROP TYPE "public"."user_metrics_activity_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_metrics_sex_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
