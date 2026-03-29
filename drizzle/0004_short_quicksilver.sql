CREATE TABLE `published_gradients` (
	`gradient_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`gradient_id`) REFERENCES `gradients`(`id`) ON UPDATE no action ON DELETE cascade
);
