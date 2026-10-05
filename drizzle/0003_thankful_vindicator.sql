ALTER TABLE `advertising_orders` ADD `payment_method` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `payment_proof_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `payment_proof_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `payment_proof_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertising_orders` ADD `payment_submitted_at` text DEFAULT '' NOT NULL;