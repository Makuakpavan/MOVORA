import { apiClient, setAccessToken, unwrap } from './client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth';

function handleAuthResponse(payload: AuthResponse): User {
  if (payload.token) setAccessToken(payload.token);
  return payload.user;
}

export const authApi = {
  /** POST /api/auth/register */
  async register(payload: RegisterPayload): Promise<User> {
    const response = await apiClient.post('/auth/register', payload);
    return handleAuthResponse(unwrap<AuthResponse>(response));
  },

  /** POST /api/auth/login */
  async login(payload: LoginPayload): Promise<User> {
    const response = await apiClient.post('/auth/login', payload);
    return handleAuthResponse(unwrap<AuthResponse>(response));
  },

  /** POST /api/auth/logout */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear locally even if the server call fails — the user asked to leave.
      setAccessToken(null);
    }
  },

  /** GET /api/auth/me — used once on boot to restore the session. */
  async me(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    const body = unwrap<User | { user: User }>(response);
    return 'user' in body ? body.user : body;
  },
};
