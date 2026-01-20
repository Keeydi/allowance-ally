# Database Setup Guide

Complete guide for setting up the Allowance Ally MySQL database.

## Prerequisites

- MySQL Server (version 5.7 or higher, or MariaDB 10.2+)
- MySQL client, HeidiSQL, phpMyAdmin, or MySQL Workbench

## Quick Setup

### Option 1: Command Line

```bash
mysql -u root -p < database/setup.sql
```

### Option 2: PowerShell Script

```powershell
.\database\create-db.ps1
```

### Option 3: MySQL Client

```sql
SOURCE database/setup.sql;
```

### Option 4: GUI Tools (HeidiSQL, phpMyAdmin, MySQL Workbench)

1. Open your MySQL GUI tool
2. Connect to your MySQL server
3. Open `database/setup.sql` file
4. Execute the entire script

## What `setup.sql` Does

The `setup.sql` file is the **ONE and ONLY** SQL script you need. It includes:

- ✅ Database creation (`allowance_ally`)
- ✅ All table schemas (users, sessions, video_tips, expenses, budgets, savings_goals)
- ✅ All migrations (including `period_type` column)
- ✅ Seed data (default users)

**Safe to run multiple times** - it handles existing databases gracefully.

**Note:** If you get an error "Duplicate column name 'period_type'", that's OK! It means the column already exists. Just ignore it and continue.

## Database Structure

### Tables

- **users** - User accounts and authentication
- **sessions** - Token-based authentication sessions
- **video_tips** - Educational video content
- **expenses** - User expense records
- **budgets** - User budget settings (includes `period_type` for daily/weekly/monthly)
- **savings_goals** - User savings goals

### Default Users

The script creates two placeholder users with placeholder password hashes:

**Admin User:**
- Email: `admin@allowanceally.com`
- Role: 1 (Admin)
- Password: ⚠️ **Placeholder - needs to be set via backend**

**Regular User:**
- Email: `user@example.com`
- Role: 0 (User)
- Password: ⚠️ **Placeholder - needs to be set via backend**

## Creating Working Accounts

### Recommended: Register via Frontend

1. Start your frontend: `npm run dev`
2. Go to `/login` page
3. Click "Don't have an account? Sign up"
4. Register with any email and password
5. The backend automatically hashes passwords and creates accounts
6. New accounts get role 0 (regular user) by default

### Alternative: Update Default Accounts

If you want to use the default accounts, generate a bcrypt hash and update:

```javascript
// In Node.js console or backend
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```

Then update in database:
```sql
USE allowance_ally;
UPDATE users 
SET password = 'YOUR_BCRYPT_HASH_HERE' 
WHERE email = 'admin@allowanceally.com';
```

## Backend Configuration

Set these in your backend `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=allowance_ally
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=2788586556239fc3edf9bee4a806f67e
JWT_EXPIRES_IN=7d
PORT=3000
```

## Verification

After running `setup.sql`, verify the setup:

```sql
USE allowance_ally;

-- Check tables
SHOW TABLES;

-- Check users
SELECT id, email, role, first_name, last_name FROM users;

-- Check budgets table structure
DESCRIBE budgets;

-- Verify period_type column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'allowance_ally' 
  AND TABLE_NAME = 'budgets' 
  AND COLUMN_NAME = 'period_type';
```

## Troubleshooting

### "mysql: command not found"
- Add MySQL to your PATH, or use the full path to mysql.exe
- Windows: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

### "Access denied"
- Check your MySQL root password
- Make sure MySQL service is running

### "Duplicate column name 'period_type'"
- This is OK! The column already exists. Just ignore the error and continue.

### "401 Unauthorized" on login
- Default users have placeholder password hashes - they won't work
- Register a new user via the frontend instead

### "500 Internal Server Error" on `/api/budget`
- Make sure the `period_type` column exists in the `budgets` table
- Run `setup.sql` again (it's safe to run multiple times)

## Security Best Practices

1. **Password Hashing**: Always use bcrypt (the backend handles this automatically)
2. **SQL Injection**: Backend uses prepared statements
3. **Token Security**: JWT with proper expiration
4. **HTTPS**: Always use HTTPS in production
5. **Change Default Passwords**: Replace placeholder hashes in production

## Files

- **`setup.sql`** - The complete database setup script (run this!)
- **`create-db.ps1`** - PowerShell helper script for Windows
- **`README.md`** - This file

All other SQL files and documentation have been consolidated into `setup.sql` and this README.
