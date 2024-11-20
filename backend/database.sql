SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
CREATE DATABASE IF NOT EXISTS `logify` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `logify`;

DELIMITER $$
DROP PROCEDURE IF EXISTS `log_rotate`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `log_rotate` ()   BEGIN
    DELETE FROM logs WHERE level = 'debug' AND timestamp < NOW() - INTERVAL 2 DAY$$

DELIMITER ;

DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` enum('debug','info','warn','error','fatal') DEFAULT NULL,
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELIMITER $$
DROP EVENT IF EXISTS `rotate_logs_event`$$
CREATE DEFINER=`root`@`localhost` EVENT `rotate_logs_event` ON SCHEDULE EVERY 1 DAY STARTS '2024-11-20 08:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Delete old logs to preserve storage' DO CALL log_rotate$$

DELIMITER ;
COMMIT;

CREATE USER 'logify'@'%' IDENTIFIED BY 'logify';
GRANT ALL PRIVILEGES ON logify.* TO 'logify'@'%';
FLUSH PRIVILEGES;
