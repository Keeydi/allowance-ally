# Allowance Ally - Complete Setup Tutorial

This tutorial will guide you through setting up and running the Allowance Ally system from scratch. Allowance Ally is a financial management application designed to help users track their allowances, expenses, budgets, and savings goals.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Overview](#system-overview)
3. [Step 1: Database Setup](#step-1-database-setup)
4. [Step 2: Backend Setup](#step-2-backend-setup)
5. [Step 3: Frontend Setup](#step-3-frontend-setup)
6. [Step 4: Running the System](#step-4-running-the-system)
7. [Step 5: Accessing the Application](#step-5-accessing-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Default Accounts](#default-accounts)
10. [Project Structure](#project-structure)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **MySQL Server** (version 5.7 or higher, or MariaDB 10.2+)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL
   - Verify installation: `mysql --version`

3. **Git** (optional, for cloning repositories)
   - Download from: https://git-scm.com/

### Optional Tools

- **MySQL Workbench** or **phpMyAdmin** (for database management)
- **Postman** or **Insomnia** (for API testing)
- A code editor like **VS Code**

---

## System Overview

Allowance Ally consists of three main components:

1. **Frontend** (React + TypeScript + Vite)
   - Port: `8080`
   - Location: Root directory
   - Framework: React 18 with TypeScript

2. **Backend** (Node.js + Express)
   - Port: `3000`
   - Location: `backend/` directory
   - API Base URL: `http://localhost:3000/api`

3. **Database** (MySQL)
   - Database Name: `allowance_ally`
   - Default Port: `3306`

---

## Step 1: Database Setup

### 1.1 Start MySQL Server

Make sure your MySQL server is running:

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Find "MySQL" service and start it if not running
- Or use XAMPP/WAMP control panel

**macOS/Linux:**
```bash
sudo systemctl start mysql
# or
sudo service mysql start
```

### 1.2 Create the Database

You have several options to create the database:

#### Option A: Using MySQL Command Line (Recommended)

1. Open your terminal/command prompt
2. Navigate to the project's database folder:
   ```bash
   cd database
   ```

3. Run the schema file:
   ```bash
   mysql -u root -p < schema.sql
   ```

4. Enter your MySQL root password when prompted

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the file: `database/schema.sql`
4. Execute the script (Ctrl+Shift+Enter or click Execute)

#### Option C: Manual SQL Commands

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Run these commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS allowance_ally;
   USE allowance_ally;
   SOURCE database/schema.sql;
   ```

### 1.3 Verify Database Creation

Verify that the database and tables were created:

```sql
USE allowance_ally;
SHOW TABLES;
```

You should see these tables:
- `users`
- `sessions`
- `video_tips`
- `expenses`
- `budgets`
- `savings_goals`

### 1.4 Create Initial Admin User

The database schema creates placeholder users, but you'll need to register real users through the API (see Step 2.3) or manually create an admin user with a proper bcrypt password hash.

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### 2.3 Create Environment File

Create a `.env` file in the `backend/` directory:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

**Or manually create** a file named `.env` in the `backend/` folder.

### 2.4 Configure Environment Variables

Open the `.env` file and add the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=allowance_ally
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=2788586556239fc3edf9bee4a806f67e
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
```

**Important:** Replace `your_mysql_password` with your actual MySQL root password.

### 2.5 Test Backend Connection

Start the backend server:

```bash
npm start
```

Or:

```bash
node server.js
```

You should see output like:

```
╔════════════════════════════════════════╗
║   Allowance Ally Backend API Server   ║
╚════════════════════════════════════════╝

✓ Database connected successfully
✓ Server running on port 3000
✓ API endpoints available at http://localhost:3000/api
```

If you see "Database connection failed", check your `.env` file and MySQL server status.

### 2.6 Create Initial Admin User (Optional)

You can create an admin user via the registration endpoint. Use Postman or curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@allowanceally.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "User"
  }'
```

Then manually update the user's role to admin in the database:

```sql
USE allowance_ally;
UPDATE users SET role = 1 WHERE email = 'admin@allowanceally.com';
```

**Note:** The backend will automatically hash passwords using bcrypt.

---

## Step 3: Frontend Setup

### 3.1 Navigate to Project Root

If you're in the `backend/` directory, go back to the root:

```bash
cd ..
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install all React dependencies and development tools. This may take a few minutes.

### 3.3 Configure Frontend Environment (Optional)

The frontend uses `http://localhost:3000/api` as the default API URL. If your backend runs on a different port or URL, create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

**Note:** The frontend uses Vite, so environment variables must be prefixed with `VITE_`.

---

## Step 4: Running the System

You need to run both the backend and frontend servers simultaneously.

### 4.1 Start the Backend Server

Open your first terminal/command prompt:

```bash
cd backend
npm start
```

Keep this terminal open. The backend should be running on `http://localhost:3000`.

### 4.2 Start the Frontend Server

Open a **second** terminal/command prompt:

```bash
# Make sure you're in the project root (not backend folder)
npm run dev
```

The frontend should start and automatically open in your browser at `http://localhost:8080`.

If it doesn't open automatically, manually navigate to: `http://localhost:8080`

### 4.3 Verify Both Servers Are Running

- **Backend:** Check `http://localhost:3000/api/health` in your browser. You should see:
  ```json
  {"status":"ok","message":"Allowance Ally API is running"}
  ```

- **Frontend:** You should see the Allowance Ally landing page at `http://localhost:8080`

---

## Step 5: Accessing the Application

### 5.1 First-Time Setup

1. **Open the application** in your browser: `http://localhost:8080`

2. **Register a new account:**
   - Click "Sign Up" or navigate to the registration page
   - Fill in your email, password, and name
   - Click "Register"

3. **Or log in** if you've already created an account

### 5.2 Application Features

Once logged in, you can access:

- **Dashboard:** Overview of your allowance, spending, and savings
- **Expenses:** Track and manage your expenses
- **Budget:** Set and manage your budget allocations
- **Savings:** Create and track savings goals
- **Reports:** View spending reports and insights
- **Discipline:** Check your financial discipline score
- **Video Tips:** Watch educational videos about financial management

### 5.3 Admin Features

If you have an admin account (role = 1), you can access:

- **Admin Dashboard:** User management
- **Admin Users:** View and manage all users
- **Admin Video Tips:** Add, edit, and delete video tips

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Database connection failed"

**Solutions:**
1. Verify MySQL server is running
2. Check your `.env` file in the `backend/` folder
3. Verify database credentials (username, password)
4. Ensure the database `allowance_ally` exists
5. Check if MySQL is running on the correct port (default: 3306)

**Test MySQL connection:**
```bash
mysql -u root -p
```

### Backend Won't Start

**Problem:** Backend server fails to start

**Solutions:**
1. Check if port 3000 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # macOS/Linux
   lsof -i :3000
   ```
2. Change the PORT in `.env` if needed
3. Verify all dependencies are installed: `npm install`
4. Check for syntax errors in `server.js`

### Frontend Won't Start

**Problem:** Frontend server fails to start

**Solutions:**
1. Check if port 8080 is already in use
2. Verify all dependencies are installed: `npm install`
3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. Check for TypeScript errors: `npm run lint`

### API Connection Issues

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Verify backend is running on port 3000
2. Check browser console for CORS errors
3. Verify `VITE_API_URL` in frontend `.env` (if set)
4. Test backend directly: `http://localhost:3000/api/health`

### Authentication Issues

**Problem:** Can't log in or register

**Solutions:**
1. Check backend logs for errors
2. Verify database connection
3. Check if JWT_SECRET is set in backend `.env`
4. Clear browser localStorage and try again
5. Verify user exists in database:
   ```sql
   USE allowance_ally;
   SELECT * FROM users;
   ```

### Module Not Found Errors

**Problem:** "Cannot find module" errors

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. For backend: `cd backend && npm install`
4. For frontend: `npm install` (in root directory)

---

## Default Accounts

### Creating Your First Admin Account

The database schema includes placeholder users, but you should create real accounts through the registration API:

1. **Register via API or Frontend:**
   - Email: `admin@allowanceally.com`
   - Password: (choose a strong password)
   - First Name: Admin
   - Last Name: User

2. **Make the account admin:**
   ```sql
   USE allowance_ally;
   UPDATE users SET role = 1 WHERE email = 'admin@allowanceally.com';
   ```

### Regular User Account

Simply register through the frontend or API - all new users are regular users (role = 0) by default.

---

## Project Structure

```
allowance-ally/
├── backend/                 # Backend API server
│   ├── node_modules/
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Backend environment variables (create this)
│
├── database/               # Database setup files
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Optional seed data
│   └── README.md          # Database documentation
│
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API clients
│   └── ...
│
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
└── TUTORIAL.md           # This file
```

---

## Quick Start Summary

For experienced developers, here's the quick version:

```bash
# 1. Setup Database
mysql -u root -p < database/schema.sql

# 2. Setup Backend
cd backend
npm install
# Create .env file with database credentials
npm start

# 3. Setup Frontend (in new terminal)
cd ..  # back to root
npm install
npm run dev
```

Then open `http://localhost:8080` in your browser.

---

## Additional Resources

- **Backend API Documentation:** See `backend/server.js` for all available endpoints
- **Database Schema:** See `database/schema.sql` for table structures
- **Database Setup Guide:** See `database/README.md` for detailed database instructions

---

## Support

If you encounter issues not covered in this tutorial:

1. Check the console/terminal for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all environment variables are set correctly
4. Check that all services (MySQL, Node.js) are running

---

## Next Steps

After successfully running the system:

1. **Create your admin account** and log in
2. **Add video tips** through the admin panel
3. **Explore the features** - track expenses, set budgets, create savings goals
4. **Customize** the application to fit your needs

Happy budgeting! 🎉
