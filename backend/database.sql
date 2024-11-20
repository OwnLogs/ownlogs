SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `logify`
--
CREATE DATABASE IF NOT EXISTS `logify` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `logify`;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL,
  `level` enum('debug','info','warn','error','fatal') DEFAULT 'debug',
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

CREATE USER 'logify'@'%' IDENTIFIED BY 'logify';
GRANT ALL PRIVILEGES ON logify.* TO 'logify'@'%';
FLUSH PRIVILEGES;
