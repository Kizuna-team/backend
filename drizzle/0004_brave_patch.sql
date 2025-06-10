CREATE TYPE "public"."orientation_enum" AS ENUM('異性戀', '同性戀', '雙性戀');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"location" varchar(255),
	"date" date NOT NULL,
	"description" text,
	"created_by" varchar(255),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(255),
	"image_key" varchar(255),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "gender" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "zodiac" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "mbti" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "job" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "name" varchar(15) NOT NULL;