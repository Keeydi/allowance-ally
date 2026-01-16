# Allowance Ally - Quick Start Guide

This is a condensed guide for quickly getting the system up and running. For detailed instructions, see [TUTORIAL.md](./TUTORIAL.md).

## Prerequisites

- Node.js 16+ installed
- MySQL Server running
- Terminal/Command Prompt

## Setup Steps

### 1. Database Setup

```bash
# Navigate to database folder
cd database

# Create database and tables
mysql -u root -p < schema.sql
# Enter your MySQL password when prompted
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd ../backend

# Install dependencies
npm install

# Create .env file with this content:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=allowance_ally
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=2788586556239fc3edf9bee4a806f67e
# JWT_EXPIRES_IN=7d
# PORT=3000

# Start backend server
npm start
```

**Keep this terminal open!** The backend should show:
```
✓ Database connected successfully
✓ Server running on port 3000
```

### 3. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to project root
cd /path/to/allowance-ally

# Install dependencies
npm install

# Start frontend server
npm run dev
```

The frontend will open at `http://localhost:8080`

## Verify Setup

1. **Backend Health Check:** Open `http://localhost:3000/api/health` in browser
   - Should show: `{"status":"ok","message":"Allowance Ally API is running"}`

2. **Frontend:** Open `http://localhost:8080` in browser
   - Should show the Allowance Ally landing page

## First Login

1. Click "Sign Up" on the landing page
2. Register with your email and password
3. Log in with your new account

## Common Issues

- **Database connection failed:** Check MySQL is running and `.env` file has correct credentials
- **Port already in use:** Change PORT in backend `.env` or kill the process using the port
- **Module not found:** Run `npm install` in the respective directory

## Need Help?

See [TUTORIAL.md](./TUTORIAL.md) for detailed instructions and troubleshooting.
