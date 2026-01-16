# Database Setup Instructions

## Quick Setup via Terminal

### Option 1: Using MySQL Command Line (Windows)

1. **Open PowerShell or Command Prompt** and navigate to the database folder:
```powershell
cd database
```

2. **Run the schema file** (replace `root` and password as needed):
```powershell
# If MySQL is in your PATH:
mysql -u root -p < schema.sql

# Or if you need full path:
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < schema.sql
```

3. **Enter your MySQL root password** when prompted.

### Option 2: Using the Batch Script (Windows)

1. **Double-click** `create-db.bat` or run from terminal:
```powershell
.\database\create-db.bat
```

2. Enter your MySQL root password when prompted.

### Option 3: Manual MySQL Commands

1. **Connect to MySQL**:
```powershell
mysql -u root -p
```

2. **Run these commands**:
```sql
CREATE DATABASE IF NOT EXISTS allowance_ally;
USE allowance_ally;
SOURCE schema.sql;
```

### Option 4: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `schema.sql` file
4. Execute the script (Ctrl+Shift+Enter)

## Verify Database Creation

After creating the database, verify it was created:

```sql
USE allowance_ally;
SHOW TABLES;
SELECT * FROM users;
```

You should see:
- `users` table
- `sessions` table (optional)
- Two default user records (with placeholder password hashes)

## Next Steps

1. **Set up your backend** with the JWT secret: `2788586556239fc3edf9bee4a806f67e`
2. **Create a `.env` file** in the `backend` folder:
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

3. **Register users via your backend API** - the backend will handle password hashing automatically

## Troubleshooting

### "mysql: command not found"
- Add MySQL to your PATH, or use the full path to mysql.exe
- On Windows: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

### "Access denied"
- Check your MySQL root password
- Make sure MySQL service is running

### "Database already exists"
- The script uses `CREATE DATABASE IF NOT EXISTS` so it's safe to run multiple times
- Tables use `CREATE TABLE IF NOT EXISTS` so they won't be duplicated

