import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { setUnauthorizedHandler } from '@/api/client';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True only while the initial session check is in flight. */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    setUser(null);
    queryClient.removeQueries({ queryKey: ['favorites'] });
  }, [queryClient]);

  // Restore the session once on boot. A 401 here is expected for guests.
  useEffect(() => {
    let cancelled = false;

    // If no API base is configured, skip attempting to hit backend routes.
    // This allows the frontend to run in environments without a connected API.
    if (!import.meta.env.VITE_API_BASE_URL) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((restored) => {
        if (!cancelled) setUser(restored);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from anywhere in the app drops us back to the guest state.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(() => {});
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setUser(await authApi.login(payload));
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setUser(await authApi.register(payload));
      await queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
