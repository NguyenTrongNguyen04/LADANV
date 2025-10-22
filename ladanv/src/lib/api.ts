/**
 * Lightweight API client tailored for LADANV auth server
 */

const API_BASE = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, '') || 'http://localhost:4000';

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  user?: T;
};

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  return apiPost('/api/auth/register', input);
}

export async function loginUser(input: { email: string; password: string }) {
  return apiPost('/api/auth/login', input);
}

export async function sendVerifyOtp() {
  return apiPost('/api/auth/send-verify-otp');
}

export async function verifyEmail(otp: string) {
  return apiPost('/api/auth/verify-email', { otp });
}

export async function isAuthenticated() {
  return apiPost('/api/auth/is-auth');
}


