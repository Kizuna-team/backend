CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
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
