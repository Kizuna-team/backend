CREATE TABLE "profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(15) NOT NULL,
	"gender" varchar(8) NOT NULL,
	"orientation" varchar(15) NOT NULL,
	"bio" text,
	"age" integer NOT NULL,
	"location" varchar(31) NOT NULL,
	"zodiac" varchar(15),
	"mbti" varchar(5),
	"job" varchar(15),
	"interests" varchar(50)[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;