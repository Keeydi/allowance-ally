# Setting Up Database with HeidiSQL

## Quick Setup Steps

### 1. Connect to MySQL
- Click **"Open"** in HeidiSQL to connect to your MySQL server
- Your session is already configured:
  - Host: 127.0.0.1
  - User: root
  - Port: 3306

### 2. Create the Database

**Option A: Using SQL Query Tab**
1. After connecting, click on the **"Query"** tab (or press F9)
2. Copy and paste the entire contents of `schema.sql`
3. Click the **"Execute"** button (or press F9)
4. The database and tables will be created

**Option B: Using File Menu**
1. After connecting, go to **File → Load SQL file...**
2. Navigate to `database/schema.sql`
3. Click **Open**
4. The SQL will load in the Query tab
5. Click **Execute** (F9)

### 3. Verify Creation

Run this query to verify:
```sql
USE allowance_ally;
SHOW TABLES;
SELECT * FROM users;
```

You should see:
- ✅ `users` table
- ✅ `sessions` table
- ✅ Two placeholder user records

## What the Schema Creates

1. **Database**: `allowance_ally`
2. **Users Table**: 
   - Stores user accounts with email, password (hashed), and role
   - Role: 0 = Regular User, 1 = Admin
3. **Sessions Table**: 
   - Optional table for token-based authentication
4. **Default Users**:
   - Admin: `admin@allowanceally.com` (role 1)
   - User: `user@example.com` (role 0)
   - ⚠️ Note: Password hashes are placeholders - set real passwords via backend API

## Next Steps

1. **Backend Setup**: Configure your backend with:
   - JWT Secret: `2788586556239fc3edf9bee4a806f67e`
   - Database connection details
   
2. **Register Users**: Use your backend API to register users (it will handle password hashing)

3. **Test Connection**: Your frontend is ready to connect to the backend API

## Troubleshooting

**"Access denied" error:**
- Check if MySQL service is running
- Verify root password (if you have one set)
- Try connecting with password in HeidiSQL session settings

**"Database already exists" error:**
- This is safe - the script uses `CREATE DATABASE IF NOT EXISTS`
- You can run it multiple times safely

**"Table already exists" error:**
- This is also safe - tables use `CREATE TABLE IF NOT EXISTS`
- Existing data won't be deleted

