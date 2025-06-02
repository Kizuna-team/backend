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
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "inventory" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;