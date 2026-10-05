CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` integer NOT NULL,
	`max_uses` integer DEFAULT 0 NOT NULL,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`expires_at` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `customer_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_name` text NOT NULL,
	`whatsapp` text NOT NULL,
	`whatsapp_normalized` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`access_token_hash` text NOT NULL,
	`completed_orders` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_accounts_whatsapp_normalized_unique` ON `customer_accounts` (`whatsapp_normalized`);--> statement-breakpoint
CREATE UNIQUE INDEX `customer_accounts_access_token_hash_unique` ON `customer_accounts` (`access_token_hash`);--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `account_id` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `subtotal_xaf` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `coupon_id` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `coupon_code` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `coupon_discount_xaf` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `loyalty_discount_xaf` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `coupon_consumed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `campaign_start` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `campaign_end` text DEFAULT '' NOT NULL;