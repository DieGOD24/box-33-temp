import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784342458109 implements MigrationInterface {
    name = 'InitialSchema1784342458109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "gender" character varying(1) NOT NULL, "category" character varying NOT NULL, "priceCents" integer, "currency" character varying NOT NULL DEFAULT 'COP', "imageUrl" character varying, "sizes" jsonb NOT NULL DEFAULT '[]', "soldOut" boolean NOT NULL DEFAULT false, "featured" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reference" character varying NOT NULL, "status" character varying NOT NULL, "amountCents" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'COP', "orderId" uuid, "wompiTransactionId" character varying, "customerName" character varying, "customerEmail" character varying, "customerPhone" character varying, "cartSnapshot" jsonb NOT NULL DEFAULT '[]', "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_866ddee0e17d9385b4e3b86851" ON "payments" ("reference") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid, "name" character varying NOT NULL, "size" character varying, "quantity" integer NOT NULL, "unitPriceCents" integer NOT NULL, "subtotalCents" integer NOT NULL, "orderId" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'paid', "totalCents" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'COP', "customerName" character varying NOT NULL, "customerEmail" character varying NOT NULL, "customerPhone" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "phone" character varying NOT NULL, "goal" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wod" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "text" text NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_73cbf267e96f67aeabf21d8c143" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "whatsappNumber" character varying NOT NULL, "instagramHandle" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "morning" jsonb NOT NULL DEFAULT '[]', "evening" jsonb NOT NULL DEFAULT '[]', "openBoxStart" character varying NOT NULL, "openBoxEnd" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "podium" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "month" character varying NOT NULL DEFAULT '', "entries" jsonb NOT NULL DEFAULT '[]', "mentions" jsonb NOT NULL DEFAULT '[]', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6f02cce3fdf7c371e42b23f4134" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "name" character varying NOT NULL, "tagline" character varying NOT NULL, "priceCents" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'COP', "unit" character varying NOT NULL, "features" jsonb NOT NULL DEFAULT '[]', "popular" boolean NOT NULL DEFAULT false, "sortOrder" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_81fbbbb81d6b241363f82c17b09" UNIQUE ("key"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "challenge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "goal" character varying NOT NULL, "prize" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5f31455ad09ea6a836a06871b7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'owner', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "challenge"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TABLE "podium"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TABLE "site_settings"`);
        await queryRunner.query(`DROP TABLE "wod"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_866ddee0e17d9385b4e3b86851"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
