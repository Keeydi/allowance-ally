/**
 * API base URL for the backend (must end with /api so paths like /auth/me become .../api/auth/me).
 * - Use VITE_API_URL if set (Vercel, .env, etc.); normalized to end with /api.
 * - In production builds, default to Railway so the app works even if env is missing.
 * - In dev, default to localhost.
 */
const PRODUCTION_API_URL = 'https://allowance-ally-production.up.railway.app/api';

function normalizeApiBase(url: string): string {
  const base = url.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

const raw =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:3000/api');

export const API_BASE_URL = normalizeApiBase(raw);
