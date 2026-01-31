# Allowance Ally

A comprehensive financial management application for tracking allowances, expenses, budgets, and savings goals.

## 🚀 Getting Started

**New to this project?** Start here:

- **[📖 Complete Tutorial](./TUTORIAL.md)** - Step-by-step setup guide with detailed instructions
- **[⚡ Quick Start Guide](./QUICKSTART.md)** - Fast setup for experienced developers
- **[🚀 Deploy via GitHub](./DEPLOYMENT.md)** - Deploy frontend (Vercel) and backend (Render) from this repo

### Quick Overview

This project consists of:
- **Frontend:** React + TypeScript + Vite (Port 8080)
- **Backend:** Node.js + Express API (Port 3000)
- **Database:** MySQL (Database: `allowance_ally`)

### Minimum Requirements

- Node.js 16+
- MySQL Server 5.7+ (or MariaDB 10.2+)
- npm or yarn

---

## How to Edit This Code

You can edit this code using your preferred IDE or code editor. The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

### Frontend
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database

## How to Deploy This Project

You can deploy this project to any hosting platform that supports Node.js applications:

- **Vercel** - Great for frontend and serverless functions
- **Netlify** - Easy deployment for static sites and serverless
- **Railway** - Full-stack deployment with database support
- **Heroku** - Traditional platform-as-a-service
- **DigitalOcean** - VPS hosting with full control
- **AWS/Azure/GCP** - Cloud platform options

For production deployment:
1. Build the frontend: `npm run build`
2. Set up environment variables for both frontend and backend
3. Configure your database connection
4. Deploy backend API to a Node.js hosting service
5. Deploy frontend build to a static hosting service or CDN
