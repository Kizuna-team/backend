CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"raw_password" varchar(20) NOT NULL,
	"subscription_plan" integer
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
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"image_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(255),
	"image_key" varchar(255),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(15) NOT NULL,
	"gender" varchar(8) NOT NULL,
	"orientation" integer NOT NULL,
	"bio" varchar(255),
	"age" integer NOT NULL,
	"location" varchar(31) NOT NULL,
	"zodiac" varchar(15),
	"mbti" varchar(5),
	"job" varchar(15),
	"interests" varchar(15)[] NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"inventory" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"category" varchar(100),
	"sales" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "gift_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(40) NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"transaction_id" varchar(100),
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gift_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"gift_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"price" integer NOT NULL,
	"description" varchar(255) DEFAULT '尚未填寫描述'
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_id" integer NOT NULL,
	"to_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan" varchar(20) NOT NULL,
	"price" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"merchanttradeno" varchar(30) NOT NULL,
	"trade_no" varchar(30),
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_subscription_plan_subscription_plans_id_fk" FOREIGN KEY ("subscription_plan") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_orders" ADD CONSTRAINT "gift_orders_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_orders" ADD CONSTRAINT "gift_orders_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_gift_order_id_gift_orders_id_fk" FOREIGN KEY ("gift_order_id") REFERENCES "public"."gift_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;