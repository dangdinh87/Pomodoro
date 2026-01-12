import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase-client';

export function useAuth() {
    const { user, setUser } = useAuthStore();

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading: useAuthStore((state) => state.isLoading),
        signOut,
    };
}
