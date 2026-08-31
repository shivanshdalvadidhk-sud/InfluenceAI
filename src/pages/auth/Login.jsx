import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showToast } from '../../components/common/Toast';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Company'); // Company or Influencer
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await authService.loginWithGoogle(role);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      if (role === 'Company') {
        navigate('/company/dashboard');
      } else {
        navigate('/influencer/dashboard');
      }
    } catch (err) {
      showToast('Google authentication failed. Try again.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all credentials.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(email, password, role);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      if (role === 'Company') {
        navigate('/company/dashboard');
      } else {
        navigate('/influencer/dashboard');
      }
    } catch (err) {
      showToast('Authentication failed. Check your password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          ✨
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Influence<span style={{ color: 'var(--primary-purple)' }}>AI</span>
        </span>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-premium)',
        }}
      >
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', marginBottom: '6px', textAlign: 'center' }}>
          Sign In to InfluenceAI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '28px', textAlign: 'center' }}>
          Access your AI match reports and influencer centrality boards.
        </p>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('Company')}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              backgroundColor: role === 'Company' ? 'white' : 'transparent',
              color: role === 'Company' ? 'var(--primary-purple)' : 'var(--text-secondary)',
              boxShadow: role === 'Company' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Brand / Company
          </button>
          <button
            type="button"
            onClick={() => setRole('Influencer')}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              backgroundColor: role === 'Influencer' ? 'white' : 'transparent',
              color: role === 'Influencer' ? 'var(--primary-purple)' : 'var(--text-secondary)',
              boxShadow: role === 'Influencer' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Influencer / Creator
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-light)' }} />
            </div>
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <span
                onClick={() => navigate('/forgot-password')}
                style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-light)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="remember" style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
            <label htmlFor="remember" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="button-gradient"
            style={{
              padding: '12px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Continue as {role}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'white',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          className="google-auth-button"
        >
          {googleLoading ? (
            <div
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid var(--primary-purple)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div style={{ marginTop: '28px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/select-role')}
            style={{ color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Up
          </span>
        </div>

        <style>{`
          .google-auth-button {
            transition: all 0.2s ease;
          }
          .google-auth-button:hover:not(:disabled) {
            background-color: #F8FAFC !important;
            border-color: var(--primary-purple) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login;
