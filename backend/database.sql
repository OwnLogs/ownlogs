SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Database creation
CREATE DATABASE IF NOT EXISTS `ownlogs` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `ownlogs`;


-- User
DROP USER IF EXISTS 'ownlogs'@'%';
CREATE USER 'ownlogs'@'%' IDENTIFIED BY 'ownlogs';
GRANT ALL PRIVILEGES ON ownlogs.* TO 'ownlogs'@'%';
FLUSH PRIVILEGES;


-- TABLES
-- User table
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` ENUM('owner','admin','guest') NOT NULL DEFAULT 'guest'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Server table
CREATE TABLE IF NOT EXISTS `server` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `publicUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monitored` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Logs table
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `level` ENUM('debug','info','warn','error','fatal') NOT NULL DEFAULT 'debug',
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'unknown',
  `serverId` int,
  FOREIGN KEY (serverId) REFERENCES server(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Server monitoring table
CREATE TABLE `serverMonitoring` (
  `id` int NOT NULL,
  `serverId` int NOT NULL,
  `duration` float NOT NULL,
  `error` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Emailing table
CREATE TABLE IF NOT EXISTS `emailing` (
  `userId` int NOT NULL,
  `serverId` int NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (serverId) REFERENCES server(id),
  FOREIGN KEY (userId) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Card table
CREATE TABLE IF NOT EXISTS `card` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `type` enum('table','graph') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `request` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `colSpan` tinyint DEFAULT '1',
  `dashboardId` int NOT NULL,
  `rank` int NOT NULL
  FOREIGN KEY (dashboardId) REFERENCES dashboard(id);
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Dashboard table
CREATE TABLE IF NOT EXISTS `dashboard` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- PROCEDURES
-- Procedure to delete old logs
DELIMITER $$
CREATE DEFINER=`ownlogs`@`%` PROCEDURE IF NOT EXISTS `log_rotate`()
BEGIN
  DELETE FROM logs WHERE level = 'debug' AND timestamp < NOW() - INTERVAL 2 DAY;
  DELETE FROM logs WHERE level = 'info' AND timestamp < NOW() - INTERVAL 7 DAY;
  DELETE FROM logs WHERE level = 'warn' AND timestamp < NOW() - INTERVAL 30 DAY;
  DELETE FROM logs WHERE level = 'error' AND timestamp < NOW() - INTERVAL 90 DAY;
  DELETE FROM logs WHERE level = 'fatal' AND timestamp < NOW() - INTERVAL 365 DAY;
END$$
DELIMITER ;


-- EVENTS
-- Event that triggers everyday that calls the log_rotate procedure
CREATE DEFINER=`ownlogs`@`%` EVENT IF NOT EXISTS `rotate_logs_event` ON SCHEDULE EVERY 1 DAY STARTS '2024-11-20 08:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Delete old logs to preserve storage' DO CALL log_rotate;

-- Add logs server to the server list
INSERT INTO `server`(`id`, `name`, `description`, `publicUrl`, `monitored`) VALUES (1, 'Logs server', 'The logs server you are looking this from.', 'http://localhost:4173', 1);

-- Add mailing row
INSERT INTO `emailing` VALUES(1, 1, 1);


COMMIT;
