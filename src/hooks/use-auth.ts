import { signOut } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  return {
    user,
    /** Any session, including a guest one: the user has data on the server. */
    hasSession: !!user,
    /** A real account (email or Google), not a guest session. */
    isAuthenticated: !!user && !user.isAnonymous,
    isLoading,
    signOut: async () => {
      await signOut();
      useAuthStore.getState().setUser(null);
    },
  };
}
