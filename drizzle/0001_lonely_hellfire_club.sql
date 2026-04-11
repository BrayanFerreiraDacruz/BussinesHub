CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`serviceId` int NOT NULL,
	`startTime` datetime NOT NULL,
	`endTime` datetime NOT NULL,
	`status` enum('scheduled','completed','cancelled','no-show') DEFAULT 'scheduled',
	`notes` text,
	`price` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20) NOT NULL,
	`birthDate` datetime,
	`notes` text,
	`totalSpent` decimal(10,2) DEFAULT '0',
	`lastVisit` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`clientId` int NOT NULL,
	`type` enum('confirmation','reminder','cancellation') DEFAULT 'confirmation',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed','bounced') DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentId` int,
	`clientId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('cash','card','pix','transfer','other') DEFAULT 'cash',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`description` text,
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`duration` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`serviceId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `businessName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `businessType` enum('salon','clinic','consulting','other') DEFAULT 'salon';