CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(255),
	"image_key" varchar(255),
	"uploaded_at" timestamp DEFAULT now()
);
