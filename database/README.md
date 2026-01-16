# Database Setup Guide

This guide explains how to set up the MySQL database for the Allowance Ally application.

## Prerequisites

- MySQL Server (version 5.7 or higher, or MariaDB 10.2+)
- MySQL client or phpMyAdmin

## Setup Instructions

### 1. Create the Database

```sql
CREATE DATABASE IF NOT EXISTS allowance_ally;
USE allowance_ally;
```

### 2. Run the Schema

Execute the `schema.sql` file to create the tables:

```bash
mysql -u your_username -p allowance_ally < database/schema.sql
```

Or using MySQL client:
```sql
SOURCE database/schema.sql;
```

### 3. Verify the Setup

Check that the tables were created:

```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE sessions;
```

### 4. Default Users

The schema includes two default users:

**Admin User:**
- Email: `admin@allowanceally.com`
- Password: `admin123` (change this in production!)
- Role: 1 (Admin)

**Regular User:**
- Email: `user@example.com`
- Password: `user123` (change this in production!)
- Role: 0 (User)

⚠️ **IMPORTANT:** These are placeholder passwords. In production, you should:
1. Use proper password hashing (bcrypt with cost 10+)
2. Change all default passwords
3. Use strong, unique passwords

## Database Structure

### Users Table

- `id`: Primary key (auto-increment)
- `email`: Unique email address
- `password`: Hashed password (use bcrypt in production)
- `role`: 0 = Regular User, 1 = Admin
- `first_name`: User's first name (optional)
- `last_name`: User's last name (optional)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_login`: Last login timestamp
- `is_active`: Account status (boolean)

### Sessions Table (Optional)

For token-based authentication:
- `id`: Session ID (primary key)
- `user_id`: Foreign key to users table
- `token`: Authentication token
- `expires_at`: Token expiration timestamp
- `created_at`: Session creation timestamp

## Backend API Requirements

Your backend API should implement the following endpoints:

### POST `/api/auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "user123"
}
```

Response (Success):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": 0,
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt_token_here"
}
```

Response (Error):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### POST `/api/auth/register`
Request:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

Response (Success):
```json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "role": 0,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "token": "jwt_token_here"
}
```

### GET `/api/auth/verify`
Headers:
```
Authorization: Bearer jwt_token_here
```

Response (Valid):
```json
{
  "valid": true,
  "user": { ... }
}
```

## Security Best Practices

1. **Password Hashing**: Always use bcrypt or Argon2 for password hashing
2. **SQL Injection**: Use prepared statements/parameterized queries
3. **Token Security**: Use JWT with proper expiration and refresh tokens
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting on login endpoints
6. **Input Validation**: Validate and sanitize all user inputs
7. **CORS**: Configure CORS properly for your frontend domain

## Environment Variables

Set these in your backend `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=allowance_ally
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

