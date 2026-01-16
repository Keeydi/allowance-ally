# Available Accounts

## Default Accounts in Database Schema

The database schema creates **2 placeholder accounts** with placeholder password hashes. These accounts **will NOT work for login** until you set real password hashes.

### 1. Admin Account
- **Email:** `admin@allowanceally.com`
- **Role:** 1 (Admin) - Redirects to `/admin` dashboard
- **Password:** ⚠️ **Placeholder hash - needs to be set**
- **Name:** Admin User

### 2. Regular User Account
- **Email:** `user@example.com`
- **Role:** 0 (User) - Redirects to `/dashboard`
- **Password:** ⚠️ **Placeholder hash - needs to be set**
- **Name:** John Doe

## ⚠️ Important: These Accounts Cannot Login Yet!

The default accounts have placeholder password hashes (`$2a$10$PLACEHOLDER_...`) and **will not work** for authentication.

## How to Create Working Accounts

### Option 1: Register Through Frontend (Recommended)
1. Start your frontend: `npm run dev`
2. Go to `/login` page
3. Click "Don't have an account? Sign up"
4. Register with any email and password
5. The backend will automatically hash the password and create the account
6. **New accounts always get role 0 (regular user)**

### Option 2: Update Default Accounts in Database

If you want to use the default accounts, you need to update their password hashes:

1. **Generate a bcrypt hash** for your desired password:
   ```javascript
   // In Node.js console or backend
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your_password', 10);
   console.log(hash);
   ```

2. **Update in database** (using HeidiSQL or MySQL):
   ```sql
   USE allowance_ally;
   
   -- Update admin password (replace HASH_HERE with actual bcrypt hash)
   UPDATE users 
   SET password = 'HASH_HERE' 
   WHERE email = 'admin@allowanceally.com';
   
   -- Update regular user password
   UPDATE users 
   SET password = 'HASH_HERE' 
   WHERE email = 'user@example.com';
   ```

### Option 3: Create Admin Account via Backend API

You can create an admin account by directly inserting into the database with a proper password hash:

```sql
USE allowance_ally;

-- First, generate the bcrypt hash in your backend, then:
INSERT INTO users (email, password, role, first_name, last_name) 
VALUES ('admin@example.com', 'BCRYPT_HASH_HERE', 1, 'Admin', 'User')
ON DUPLICATE KEY UPDATE email=email;
```

## Check Existing Accounts

To see all accounts in your database, run this SQL query:

```sql
USE allowance_ally;
SELECT id, email, role, first_name, last_name, created_at, is_active 
FROM users;
```

## Quick Test Accounts

If you want to quickly test, register these accounts through the frontend:

**Test Admin (you'll need to manually change role in database):**
- Email: `admin@test.com`
- Password: `admin123`
- After registration, update role in database:
  ```sql
  UPDATE users SET role = 1 WHERE email = 'admin@test.com';
  ```

**Test User:**
- Email: `user@test.com`
- Password: `user123`
- This will work immediately (role 0 by default)

## Summary

- **Default accounts:** Exist but have placeholder passwords (won't work)
- **Best approach:** Register new accounts through the frontend
- **Admin accounts:** Must be created manually or role updated in database
- **All new registrations:** Get role 0 (regular user) by default

