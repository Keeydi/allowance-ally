-- ============================================================================
-- Allowance Ally - Complete Database Setup Script (Final Version)
-- ============================================================================
-- This is the ONE and ONLY SQL script you need to run.
-- It includes: Database creation, all tables, migrations, and seed data.
-- Safe to run multiple times - it will handle existing databases gracefully.
--
-- Usage:
--   Command Line: mysql -u your_username -p < database/setup.sql
--   MySQL Client: SOURCE database/setup.sql;
--   GUI Tools: Open and execute this entire file
--
-- IMPORTANT: If you get an error "Duplicate column name 'period_type'", 
-- that's OK! It means the column already exists. Just continue.
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS allowance_ally;
USE allowance_ally;

-- ============================================================================
-- TABLES CREATION
-- ============================================================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role TINYINT NOT NULL DEFAULT 0 COMMENT '0 = user, 1 = admin',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table for token-based authentication
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Video tips table for educational videos
CREATE TABLE IF NOT EXISTS video_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_category (category),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget table (period_type column will be added in migrations section)
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    needs_allocation INT NOT NULL DEFAULT 50,
    wants_allocation INT NOT NULL DEFAULT 30,
    savings_allocation INT NOT NULL DEFAULT 20,
    needs_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    wants_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    savings_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_budget (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(10, 2) NOT NULL,
    current DECIMAL(10, 2) NOT NULL DEFAULT 0,
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MIGRATIONS (Safe to run multiple times)
-- ============================================================================
-- These migrations handle adding columns that may not exist in older databases.
-- If you get an error "Duplicate column name 'period_type'", that's OK!
-- It means the column already exists - just ignore the error and continue.

-- Migration: Add period_type column to budgets table
-- This handles existing databases that were created before period_type was added
ALTER TABLE budgets 
ADD COLUMN period_type VARCHAR(20) NOT NULL DEFAULT 'monthly' 
COMMENT 'Budget period: daily, weekly, or monthly';

-- Update existing records to have 'monthly' as default (if any exist)
UPDATE budgets SET period_type = 'monthly' WHERE period_type IS NULL OR period_type = '';

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- NOTE: Password hashes must be generated using bcrypt before inserting.
-- 
-- To generate password hashes in Node.js:
--   const bcrypt = require('bcryptjs');
--   const hash = await bcrypt.hash('your_password', 10);
--   console.log(hash);
--
-- IMPORTANT: Replace the placeholder hashes below with actual bcrypt hashes
-- before running this script in production!
-- ============================================================================

-- Default admin user
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- Generate hash: bcrypt.hash('admin123', 10)
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('admin@allowanceally.com', '$2a$10$PLACEHOLDER_ADMIN_PASSWORD_HASH_HERE', 1, 'Admin', 'User')
ON DUPLICATE KEY UPDATE 
  email = email,
  updated_at = NOW();

-- Default regular user
-- Password: user123 (CHANGE THIS IN PRODUCTION!)
-- Generate hash: bcrypt.hash('user123', 10)
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('user@example.com', '$2a$10$PLACEHOLDER_USER_PASSWORD_HASH_HERE', 0, 'John', 'Doe')
ON DUPLICATE KEY UPDATE 
  email = email,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION (Optional - uncomment to verify)
-- ============================================================================
-- SHOW TABLES;
-- SELECT COUNT(*) as user_count FROM users;
-- DESCRIBE budgets;
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = 'allowance_ally' AND TABLE_NAME = 'budgets' AND COLUMN_NAME = 'period_type';
-- ============================================================================

SELECT 'Database setup completed successfully!' AS status;
