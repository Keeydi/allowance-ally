-- ============================================================================
-- Allowance Ally - PostgreSQL / Supabase Setup
-- ============================================================================
-- For Supabase (PostgreSQL). Run in: Supabase Dashboard > SQL Editor > New query.
--
-- Do NOT run setup.sql (MySQL) in Supabase - it uses MySQL-only syntax.
-- This file uses PostgreSQL syntax (SERIAL, ON CONFLICT, etc.).
--
-- Note: The Node backend (server.js) currently uses MySQL. To use Supabase
-- as the app database you would need to switch the backend to PostgreSQL
-- (e.g. pg + connection string from Supabase). This script creates the
-- schema in Supabase for that or for reference.
-- ============================================================================

-- Users table (auth is via Supabase Auth; this table stores app profile + link)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    supabase_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role SMALLINT NOT NULL DEFAULT 0,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users (supabase_id);
COMMENT ON COLUMN users.role IS '0 = user, 1 = admin';

-- Sessions table (optional; Supabase handles sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

-- Video tips
CREATE TABLE IF NOT EXISTS video_tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_video_tips_category ON video_tips (category);
CREATE INDEX IF NOT EXISTS idx_video_tips_created_at ON video_tips (created_at);
CREATE INDEX IF NOT EXISTS idx_video_tips_is_active ON video_tips (is_active);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, date);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_allowance >= 0),
    needs_allocation INT NOT NULL DEFAULT 50 CHECK (needs_allocation >= 0 AND needs_allocation <= 100),
    wants_allocation INT NOT NULL DEFAULT 30 CHECK (wants_allocation >= 0 AND wants_allocation <= 100),
    savings_allocation INT NOT NULL DEFAULT 20 CHECK (savings_allocation >= 0 AND savings_allocation <= 100),
    needs_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (needs_spent >= 0),
    wants_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (wants_spent >= 0),
    savings_spent DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (savings_spent >= 0),
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
    last_reset_date DATE,
    carryover_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (carryover_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_allocations_sum CHECK (needs_allocation + wants_allocation + savings_allocation = 100)
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period_type ON budgets (period_type);
CREATE INDEX IF NOT EXISTS idx_budgets_last_reset_date ON budgets (last_reset_date);

-- Savings goals
CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(10, 2) NOT NULL CHECK (target > 0),
    current DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (current >= 0),
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_target_date ON savings_goals (target_date);

-- Optional: auto-update updated_at (PostgreSQL has no ON UPDATE CURRENT_TIMESTAMP)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
-- sessions has no updated_at, skip
DROP TRIGGER IF EXISTS video_tips_updated_at ON video_tips;
CREATE TRIGGER video_tips_updated_at BEFORE UPDATE ON video_tips
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS budgets_updated_at ON budgets;
CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS savings_goals_updated_at ON savings_goals;
CREATE TRIGGER savings_goals_updated_at BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Seed (optional; skip or change passwords in production)
INSERT INTO users (email, password, role, first_name, last_name)
VALUES
    ('admin@allowanceally.com', '$2a$10$PLACEHOLDER_ADMIN_PASSWORD_HASH_HERE', 1, 'Admin', 'User'),
    ('user@example.com', '$2a$10$PLACEHOLDER_USER_PASSWORD_HASH_HERE', 0, 'John', 'Doe')
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = CURRENT_TIMESTAMP;

SELECT 'Supabase/PostgreSQL setup completed successfully!' AS status;
