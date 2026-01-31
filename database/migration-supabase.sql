-- ============================================================================
-- Migration: Add Supabase auth support to users table
-- Run this after setup.sql if you use Supabase for login/signup.
-- If the column already exists, skip the ADD COLUMN line or run once.
-- ============================================================================
USE allowance_ally;

-- Allow linking a user to a Supabase auth user (UUID)
ALTER TABLE users
  ADD COLUMN supabase_id VARCHAR(36) UNIQUE NULL COMMENT 'Supabase auth.users id (UUID)';

CREATE INDEX idx_supabase_id ON users (supabase_id);

-- Allow NULL password for Supabase-only users (optional)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
