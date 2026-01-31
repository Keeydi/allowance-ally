# Backend API Setup

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Make sure your `.env` file exists in the `backend` folder with:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=allowance_ally
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=2788586556239fc3edf9bee4a806f67e
JWT_EXPIRES_IN=7d
PORT=3000

# Supabase (login/signup) - get from Supabase Dashboard > Settings > API > JWT Secret
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

### 3. Start the Server

```bash
npm start
```

Or for development:
```bash
node server.js
```

The server will start on `http://localhost:3000`

## Supabase Login/Signup

If you use **Supabase** for auth:

1. Run the MySQL migration so the backend can link Supabase users to app users:
   ```bash
   mysql -u root -p allowance_ally < database/migration-supabase.sql
   ```
2. In backend `.env`, set **SUPABASE_JWT_SECRET** from Supabase Dashboard → **Settings** → **API** → **JWT Secret** (used to verify Supabase access tokens).
3. In project root `.env` (frontend), set **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** from the same API settings.

Login and signup then go through Supabase; the backend creates a matching MySQL user on first request and uses it for budgets/expenses.

## API Endpoints

- **POST** `/api/auth/login` - User login (legacy; frontend uses Supabase)
- **POST** `/api/auth/register` - User registration (legacy; frontend uses Supabase)
- **GET** `/api/auth/me` - Current user (syncs Supabase user to MySQL)
- **GET** `/api/auth/verify` - Verify JWT token
- **GET** `/api/health` - Health check

## Testing

Once the server is running, you can test it:

```bash
# Health check
curl http://localhost:3000/api/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Frontend Configuration

In the project root (frontend) `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

