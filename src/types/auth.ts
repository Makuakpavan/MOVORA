export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  /**
   * Only present if your backend returns a bearer token instead of setting an
   * httpOnly cookie. See src/api/client.ts for how to switch strategies.
   */
  token?: string;
}
