CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"location" varchar(255),
	"date" date,
	"description" text,
	"created_by" varchar(255),
	"createdAt" timestamp DEFAULT now()
);
