-- ========================================================
-- KAIF ZAKI PORTFOLIO DATABASE SCHEMA (MySQL)
-- Tables creation only
-- ========================================================

CREATE DATABASE IF NOT EXISTS `kaif_portfolio_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `kaif_portfolio_db`;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profile` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `name` VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(20) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `tagline` VARCHAR(255),
  `hero_tagline` VARCHAR(255),
  `hero_sub` TEXT,
  `watermark` VARCHAR(50),
  `about_image` VARCHAR(255) DEFAULT '/assets/about-developer.gif',
  `about_headline` VARCHAR(255),
  `bio_paragraph_1` TEXT,
  `bio_paragraph_2` TEXT,
  `email` VARCHAR(150),
  `phone` VARCHAR(50),
  `location` VARCHAR(150),
  `github` VARCHAR(255),
  `github_handle` VARCHAR(100),
  `linkedin` VARCHAR(255),
  `linkedin_handle` VARCHAR(100),
  `resume_url` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `count_num` INT NOT NULL,
  `unit` VARCHAR(20) DEFAULT '',
  `label` VARCHAR(150) NOT NULL,
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `marquee_tools` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `series` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tag` VARCHAR(100),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` VARCHAR(255),
  `link` VARCHAR(255) DEFAULT '#projects',
  `cta` VARCHAR(100) DEFAULT 'Explore architecture →',
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `icon_svg` TEXT,
  `chips` TEXT NOT NULL,
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `experience` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) NOT NULL,
  `location` VARCHAR(100),
  `period` VARCHAR(100) NOT NULL,
  `bullets` JSON NOT NULL,
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `tag` VARCHAR(150),
  `year` VARCHAR(50),
  `is_wide` BOOLEAN DEFAULT FALSE,
  `description` TEXT,
  `outcomes` JSON NOT NULL,
  `chips` TEXT,
  `diagram_url` VARCHAR(255),
  `diagram_alt` VARCHAR(255),
  `github_url` VARCHAR(255) DEFAULT '',
  `live_url` VARCHAR(255) DEFAULT '',
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `issuer` VARCHAR(150),
  `link` VARCHAR(255) DEFAULT '#',
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `education` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `degree` VARCHAR(200) NOT NULL,
  `institution` VARCHAR(200) NOT NULL,
  `period` VARCHAR(100),
  `coursework` TEXT,
  `order_idx` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `availability` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `open_to_work` BOOLEAN DEFAULT TRUE,
  `badge_text` VARCHAR(100) DEFAULT 'Open to work',
  `engagement` VARCHAR(150),
  `target_roles` VARCHAR(255),
  `location` VARCHAR(150),
  `work_mode` VARCHAR(150),
  `subtext` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
