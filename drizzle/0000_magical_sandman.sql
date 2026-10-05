CREATE TABLE `advertising_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`customer_name` text NOT NULL,
	`business_name` text NOT NULL,
	`whatsapp` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`duration_days` integer NOT NULL,
	`poster_design` integer DEFAULT false NOT NULL,
	`message` text NOT NULL,
	`total_xaf` integer NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `advertising_orders_reference_unique` ON `advertising_orders` (`reference`);