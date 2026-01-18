-- Migration: Add period_type column to budgets table
-- Run this script to add support for daily, weekly, and monthly budget periods

USE allowance_ally;

-- Add period_type column if it doesn't exist
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS period_type VARCHAR(20) NOT NULL DEFAULT 'monthly' 
COMMENT 'Budget period: daily, weekly, or monthly';

-- Update existing records to have 'monthly' as default (if any exist)
UPDATE budgets SET period_type = 'monthly' WHERE period_type IS NULL OR period_type = '';
