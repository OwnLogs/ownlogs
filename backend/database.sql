SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Database creation
CREATE DATABASE IF NOT EXISTS `logify` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `logify`;


-- User
DROP USER IF EXISTS 'logify'@'%';
CREATE USER 'logify'@'%' IDENTIFIED BY 'logify';
GRANT ALL PRIVILEGES ON logify.* TO 'logify'@'%';
FLUSH PRIVILEGES;


-- TABLES
-- User table
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` ENUM('owner','admin','guest') NOT NULL DEFAULT 'guest'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Server table
CREATE TABLE IF NOT EXISTS `server` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `publicUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- Logs table
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `level` ENUM('debug','info','warn','error','fatal') NOT NULL DEFAULT 'debug',
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(255) NOT NULL DEFAULT 'unknown',
  `serverId` int,
  FOREIGN KEY (serverId) REFERENCES server(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- PROCEDURES
-- Procedure to delete old logs
DELIMITER $$
CREATE DEFINER=`logify`@`%` PROCEDURE IF NOT EXISTS `log_rotate`()
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
CREATE DEFINER=`logify`@`%` EVENT IF NOT EXISTS `rotate_logs_event` ON SCHEDULE EVERY 1 DAY STARTS '2024-11-20 08:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Delete old logs to preserve storage' DO CALL log_rotate;

-- Add logs server to the server list
INSERT INTO `server`(`id`, `name`, `description`, `publicUrl`) VALUES (1, 'Logs server', 'The logs server you are looking this from.', 'http://localhost:4173');


COMMIT;
