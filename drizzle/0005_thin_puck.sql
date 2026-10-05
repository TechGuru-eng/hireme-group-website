CREATE TABLE `advertising_clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`visitor_hash` text NOT NULL,
	`referrer` text DEFAULT '' NOT NULL,
	`clicked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_advertising_clicks_order_visitor` ON `advertising_clicks` (`order_id`,`visitor_hash`);--> statement-breakpoint
CREATE INDEX `idx_advertising_clicks_order` ON `advertising_clicks` (`order_id`);--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `cta_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `cta_destination` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `tracking_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `click_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `unique_click_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `last_clicked_at` text DEFAULT '' NOT NULL;