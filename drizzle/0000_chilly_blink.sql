CREATE TYPE "public"."orientation_enum" AS ENUM('異性戀', '同性戀', '雙性戀');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"raw_password" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"gender" varchar(1) NOT NULL,
	"bio" varchar(255),
	"age" integer NOT NULL,
	"location" varchar(31) NOT NULL,
	"zodiac" varchar(15) NOT NULL,
	"mbti" varchar(5) NOT NULL,
	"job" varchar(15) NOT NULL,
	"interests" varchar(15)[] NOT NULL,
	"orientation" "orientation_enum" NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;