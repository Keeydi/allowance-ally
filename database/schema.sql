-- Allowance Ally Database Schema
-- MySQL Database for User Authentication and Management

-- Create database (uncomment if needed)
CREATE DATABASE IF NOT EXISTS allowance_ally;
USE allowance_ally;

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

-- Insert default admin user
-- NOTE: These are placeholder password hashes. In production, you MUST:
-- 1. Generate proper bcrypt hashes using your backend (see backend/example-api.js)
-- 2. Change these default passwords immediately
-- 3. Use strong, unique passwords
-- 
-- To generate a bcrypt hash in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
--
-- Example: password 'admin123' should be hashed before inserting
-- Use your backend API to register users, which will handle password hashing
-- Or generate bcrypt hash: const hash = await bcrypt.hash('admin123', 10);
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('admin@allowanceally.com', '$2a$10$PLACEHOLDER_ADMIN_PASSWORD_HASH_HERE', 1, 'Admin', 'User')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample regular user
-- NOTE: Replace the password hash with a real bcrypt hash
-- Use your backend API to register users, which will handle password hashing
-- Or generate bcrypt hash: const hash = await bcrypt.hash('user123', 10);
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('user@example.com', '$2a$10$PLACEHOLDER_USER_PASSWORD_HASH_HERE', 0, 'John', 'Doe')
ON DUPLICATE KEY UPDATE email=email;

-- Optional: Create sessions table for token-based authentication
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

-- Budget table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly' COMMENT 'Budget period: daily, weekly, or monthly',
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

