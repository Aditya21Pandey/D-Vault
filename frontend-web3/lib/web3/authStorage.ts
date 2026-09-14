/**
 * Simple localStorage helpers for persisting the backend JWT.
 * Only runs in the browser (guards against SSR).
 */

const JWT_KEY = "dvault_jwt";

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JWT_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_KEY);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JWT_KEY);
}
