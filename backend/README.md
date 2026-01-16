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

## API Endpoints

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
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

Make sure your frontend `.env` file has:
```env
VITE_API_URL=http://localhost:3000/api
```

