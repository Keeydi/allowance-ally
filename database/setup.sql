-- ============================================================================
-- Allowance Ally - Complete Database Setup Script (Optimized Version)
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
-- CALCULATION FORMULAS:
--   Category Budget = (total_allowance * category_allocation) / 100
--   Available Budget = total_allowance + carryover_amount
--   Remaining Budget = available_budget - (needs_spent + wants_spent + savings_spent)
--   Budget Used % = (total_spent / total_allowance) * 100
--
-- DATA INTEGRITY CONSTRAINTS:
--   - Allocations (needs + wants + savings) must sum to exactly 100%
--   - All amounts must be non-negative
--   - Expense amounts must be positive (> 0)
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
-- Amount must be positive (expenses are always positive values)
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_user_date (user_id, date), -- Composite index for common query pattern
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget table
-- Allocations are stored as percentages (0-100) and must sum to 100
-- Spent amounts track actual spending per category for the current period
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_allowance >= 0),
    needs_allocation INT NOT NULL DEFAULT 50 CHECK (needs_allocation >= 0 AND needs_allocation <= 100),
    wants_allocation INT NOT NULL DEFAULT 30 CHECK (wants_allocation >= 0 AND wants_allocation <= 100),
    savings_allocation INT NOT NULL DEFAULT 20 CHECK (savings_allocation >= 0 AND savings_allocation <= 100),
    needs_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (needs_spent >= 0),
    wants_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (wants_spent >= 0),
    savings_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (savings_spent >= 0),
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly' COMMENT 'Budget period: daily, weekly, or monthly',
    last_reset_date DATE NULL COMMENT 'Last date when budget was reset (for daily/weekly/monthly periods)',
    carryover_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (carryover_amount >= 0) COMMENT 'Amount carried over from previous period',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_budget (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Ensure allocations sum to exactly 100%
    CONSTRAINT chk_allocations_sum CHECK (needs_allocation + wants_allocation + savings_allocation = 100),
    INDEX idx_user_id (user_id),
    INDEX idx_period_type (period_type),
    INDEX idx_last_reset_date (last_reset_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Savings goals table
-- Target and current amounts must be non-negative
-- Current amount should not exceed target (enforced at application level for flexibility)
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(10, 2) NOT NULL CHECK (target > 0),
    current DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (current >= 0),
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_target_date (target_date), -- For querying goals by deadline
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MIGRATIONS (Safe to run multiple times - handles existing databases)
-- ============================================================================
-- These migrations safely add columns that may not exist in older databases.
-- Uses stored procedures to check for column existence before adding.

DELIMITER $$

-- Procedure to safely add column if it doesn't exist
DROP PROCEDURE IF EXISTS AddColumnIfNotExists$$
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(64),
    IN columnName VARCHAR(64),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE columnExists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO columnExists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName
      AND COLUMN_NAME = columnName;
    
    IF columnExists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

-- Migration: Add period_type column to budgets table (if not exists)
CALL AddColumnIfNotExists(
    'budgets',
    'period_type',
    'VARCHAR(20) NOT NULL DEFAULT ''monthly'' COMMENT ''Budget period: daily, weekly, or monthly'''
);

-- Migration: Add last_reset_date column (if not exists)
CALL AddColumnIfNotExists(
    'budgets',
    'last_reset_date',
    'DATE NULL COMMENT ''Last date when budget was reset (for daily/weekly/monthly periods)'''
);

-- Migration: Add carryover_amount column (if not exists)
CALL AddColumnIfNotExists(
    'budgets',
    'carryover_amount',
    'DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT ''Amount carried over from previous period'''
);

-- Update existing records to have default values
UPDATE budgets SET period_type = 'monthly' WHERE period_type IS NULL OR period_type = '';
UPDATE budgets SET last_reset_date = CURDATE() WHERE last_reset_date IS NULL;
UPDATE budgets SET carryover_amount = 0 WHERE carryover_amount IS NULL;

-- Clean up procedure
DROP PROCEDURE IF EXISTS AddColumnIfNotExists$$

DELIMITER ;

-- Add CHECK constraints if they don't exist (MySQL 8.0.16+)
-- Note: For older MySQL versions, these constraints may need to be added manually
-- or handled at the application level
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'budgets' 
      AND CONSTRAINT_NAME = 'chk_allocations_sum'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE budgets ADD CONSTRAINT chk_allocations_sum CHECK (needs_allocation + wants_allocation + savings_allocation = 100)',
    'SELECT ''Constraint chk_allocations_sum already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
  password = VALUES(password),
  role = VALUES(role),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  updated_at = NOW();

-- Default regular user
-- Password: user123 (CHANGE THIS IN PRODUCTION!)
-- Generate hash: bcrypt.hash('user123', 10)
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('user@example.com', '$2a$10$PLACEHOLDER_USER_PASSWORD_HASH_HERE', 0, 'John', 'Doe')
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
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
