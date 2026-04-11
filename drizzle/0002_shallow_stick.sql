CREATE TABLE `notificationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`whatsappEnabled` boolean DEFAULT true,
	`reminderBefore24h` boolean DEFAULT true,
	`reminderBefore1h` boolean DEFAULT true,
	`sendConfirmation` boolean DEFAULT true,
	`sendCancellation` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `whatsappNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`clientId` int NOT NULL,
	`clientPhone` varchar(20) NOT NULL,
	`type` enum('confirmation','reminder_24h','reminder_1h','cancellation') DEFAULT 'confirmation',
	`message` text,
	`sentAt` timestamp,
	`status` enum('pending','sent','failed','read') DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappNotifications_id` PRIMARY KEY(`id`)
);
