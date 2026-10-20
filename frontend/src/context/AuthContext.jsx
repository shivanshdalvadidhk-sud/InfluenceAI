import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const normalizeRole = (role) => {
  if (!role) return null;
  const lower = String(role).trim().toLowerCase();
  if (lower === 'company' || lower === 'brand') return 'brand';
  if (lower === 'influencer' || lower === 'creator') return 'influencer';
  return lower;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session and role with 24-hour persistence
  const processSession = async (currentSession) => {
    const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

    if (!currentSession?.user) {
      // Check if user has an active session persisted in localStorage within the 24-hour window
      const storedUserStr = localStorage.getItem('influenceai_user');
      const sessionExpiresStr = localStorage.getItem('influenceai_session_expires');
      const now = Date.now();

      if (storedUserStr && (!sessionExpiresStr || now < Number(sessionExpiresStr))) {
        try {
          const parsedUser = JSON.parse(storedUserStr);
          const legacyRole = localStorage.getItem('influenceai_role') || parsedUser.role;
          const userRole = normalizeRole(parsedUser.canonicalRole || legacyRole);

          setUser(parsedUser);
          setRole(userRole);
          setSession({ user: parsedUser, access_token: localStorage.getItem('influenceai_token') || '' });
          // Ensure session expiration is set to 24 hours from now
          if (!sessionExpiresStr) {
            localStorage.setItem('influenceai_session_expires', String(now + SESSION_DURATION_MS));
          }
          setLoading(false);
          return;
        } catch (_) {}
      }

      setSession(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem('influenceai_user');
      localStorage.removeItem('influenceai_role');
      localStorage.removeItem('influenceai_token');
      localStorage.removeItem('influenceai_session_expires');
      setLoading(false);
      return;
    }

    setSession(currentSession);
    const currentUser = currentSession.user;
    setUser(currentUser);
    localStorage.setItem('influenceai_token', currentSession.access_token);
    localStorage.setItem('influenceai_session_expires', String(Date.now() + SESSION_DURATION_MS));

    // Determine role from user_metadata first
    let userRole = normalizeRole(currentUser.user_metadata?.role);

    // Fallback: check public.profiles or public.influencers or public.brands
    if (!userRole) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profile?.role) {
          userRole = normalizeRole(profile.role);
        } else {
          // Check brands table
          const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (brand) {
            userRole = 'brand';
          } else {
            // Check influencers table
            const { data: infl } = await supabase
              .from('influencers')
              .select('id')
              .eq('user_id', currentUser.id)
              .maybeSingle();
            if (infl) {
              userRole = 'influencer';
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching user role profile:', err.message);
      }
    }

    // Default to 'brand' if unresolved
    if (!userRole) {
      userRole = 'brand';
    }

    setRole(userRole);

    // Backwards-compatible localStorage for existing components
    const legacyRole = userRole === 'influencer' ? 'Influencer' : 'Company';
    localStorage.setItem(
      'influenceai_user',
      JSON.stringify({
        id: currentUser.id,
        email: currentUser.email,
        role: legacyRole,
        canonicalRole: userRole,
        metadata: currentUser.user_metadata,
      })
    );
    localStorage.setItem('influenceai_role', legacyRole);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Initial session load
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      processSession(initSession);
    });

    // 2. Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      await processSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, role: selectedRole, metadata = {} }) => {
    const canonicalRole = normalizeRole(selectedRole) || 'brand';
    const legacyRole = canonicalRole === 'influencer' ? 'Influencer' : 'Company';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: canonicalRole,
          display_role: legacyRole,
          ...metadata,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Upsert into public.profiles for persistent role tracking
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          role: canonicalRole,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Could not upsert profile record:', profileErr.message);
      }
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.session) {
      await processSession(data.session);
    }
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    localStorage.removeItem('influenceai_user');
    localStorage.removeItem('influenceai_role');
    localStorage.removeItem('influenceai_token');
    localStorage.removeItem('influenceai_session_expires');
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!session?.user,
        isBrand: role === 'brand',
        isInfluencer: role === 'influencer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
