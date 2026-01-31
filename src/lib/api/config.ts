/**
 * API base URL for the backend.
 * - Use VITE_API_URL if set (Vercel, .env, etc.).
 * - In production builds, default to Railway so the app works even if env is missing.
 * - In dev, default to localhost.
 */
const PRODUCTION_API_URL = 'https://allowance-ally-production.up.railway.app/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:3000/api');
