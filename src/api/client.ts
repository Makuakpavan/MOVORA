import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { ApiError } from '@/types/api';

/* ---------------------------------------------------------------------------
 * AUTH STRATEGY
 *
 * Default: httpOnly cookies. The browser stores the session cookie, JavaScript
 * cannot read it, so an XSS bug cannot steal the session. `withCredentials`
 * sends it on every request. Your Express app needs:
 *
 *   app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
 *
 * Alternative: bearer tokens. If your backend returns `{ token }` on login,
 * set USE_BEARER_TOKEN to true. The token then lives in memory for the tab's
 * lifetime and is mirrored to sessionStorage so a refresh doesn't log you out.
 * That is a deliberate trade-off — sessionStorage is readable by any script on
 * the page, so cookies remain the safer default.
 * ------------------------------------------------------------------------- */
const USE_BEARER_TOKEN = false;
const TOKEN_KEY = 'movora.token';

let accessToken: string | null =
  USE_BEARER_TOKEN && typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem(TOKEN_KEY)
    : null;

export function setAccessToken(token: string | null) {
  if (!USE_BEARER_TOKEN) return;
  accessToken = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

/** Called by AuthContext when the server rejects our credentials. */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (USE_BEARER_TOKEN && accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string>; code?: string }>) => {
    // No response at all: DNS failure, server down, CORS, timeout.
    if (!error.response) {
      return Promise.reject(
        new ApiError({
          status: 0,
          message:
            error.code === 'ECONNABORTED'
              ? 'The server took too long to respond. Try again.'
              : "Can't reach the server. Check your connection and try again.",
        }),
      );
    }

    const { status, data } = error.response;

    if (status === 401) {
      setAccessToken(null);
      onUnauthorized();
    }

    return Promise.reject(
      new ApiError({
        status,
        message: data?.message ?? defaultMessageFor(status),
        code: data?.code,
        fieldErrors: data?.errors,
      }),
    );
  },
);

function defaultMessageFor(status: number): string {
  if (status === 401) return 'Sign in to continue.';
  if (status === 403) return "You don't have access to this.";
  if (status === 404) return "We couldn't find that.";
  if (status === 429) return 'Too many requests. Wait a moment and try again.';
  if (status >= 500) return 'The server ran into a problem. Try again shortly.';
  return 'Something went wrong with that request.';
}

/**
 * Unwraps `{ data: ... }` envelopes so callers always get the payload itself.
 * Works with both `res.json({ data: movie })` and `res.json(movie)`.
 */
export function unwrap<T>(response: AxiosResponse<T | { data: T }>): T {
  const body = response.data as T | { data: T };
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}
