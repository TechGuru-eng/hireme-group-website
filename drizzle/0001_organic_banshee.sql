ALTER TABLE `advertising_orders` ADD `flyer_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `flyer_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `flyer_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `copywriting` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `advertising_text` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `admin_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;