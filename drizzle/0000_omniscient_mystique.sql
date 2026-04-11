CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`google_email` text NOT NULL,
	`encrypted_refresh_token` text NOT NULL,
	`access_token` text,
	`access_token_expires_at` integer,
	`display_color` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_user_email_uniq` ON `accounts` (`user_id`,`google_email`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	`google_event_id` text NOT NULL,
	`ical_uid` text,
	`title` text,
	`description` text,
	`location` text,
	`start_ts` integer NOT NULL,
	`end_ts` integer NOT NULL,
	`is_all_day` integer DEFAULT false NOT NULL,
	`tz` text,
	`status` text,
	`response_status` text,
	`html_link` text,
	`hangout_link` text,
	`raw_json` text,
	`synced_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_account_event_uniq` ON `events` (`account_id`,`google_event_id`);--> statement-breakpoint
CREATE TABLE `sync_state` (
	`account_id` integer PRIMARY KEY NOT NULL,
	`last_sync_token` text,
	`last_full_sync_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`created_at` integer NOT NULL
);
