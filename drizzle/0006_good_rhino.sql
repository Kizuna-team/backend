ALTER TABLE "gift_orders" ADD COLUMN "order_id" varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE "gift_orders" ADD COLUMN "status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "gift_orders" ADD COLUMN "transaction_id" varchar(100);--> statement-breakpoint
ALTER TABLE "gift_orders" ADD COLUMN "amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "gift_orders" ADD CONSTRAINT "gift_orders_order_id_unique" UNIQUE("order_id");