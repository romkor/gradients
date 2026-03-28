CREATE TABLE `gradients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`angle` integer NOT NULL,
	`stops` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
