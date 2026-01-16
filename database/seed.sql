-- Seed script to create test users with proper password hashes
-- Run this AFTER setting up your backend to generate proper password hashes
-- 
-- This file shows examples of how to insert users with hashed passwords
-- In practice, use your backend API to register users, which will handle hashing

-- Example: Admin user
-- Password: admin123
-- Generate hash using: bcrypt.hash('admin123', 10)
-- Then replace the hash below
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('admin@allowanceally.com', 'GENERATE_BCRYPT_HASH_FOR_admin123', 1, 'Admin', 'User')
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  updated_at = NOW();

-- Example: Regular user
-- Password: user123
-- Generate hash using: bcrypt.hash('user123', 10)
-- Then replace the hash below
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('user@example.com', 'GENERATE_BCRYPT_HASH_FOR_user123', 0, 'John', 'Doe')
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  updated_at = NOW();

-- Note: To generate password hashes, you can use Node.js:
-- 
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);
--
-- Or use an online bcrypt generator (for testing only, not production!)

