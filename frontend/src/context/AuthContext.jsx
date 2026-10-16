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

  // Sync session and role
  const processSession = async (currentSession) => {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem('influenceai_user');
      localStorage.removeItem('influenceai_role');
      localStorage.removeItem('influenceai_token');
      setLoading(false);
      return;
    }

    setSession(currentSession);
    const currentUser = currentSession.user;
    setUser(currentUser);
    localStorage.setItem('influenceai_token', currentSession.access_token);

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
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('influenceai_user');
    localStorage.removeItem('influenceai_role');
    localStorage.removeItem('influenceai_token');
    setSession(null);
    setUser(null);
    setRole(null);
    if (error) throw error;
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
