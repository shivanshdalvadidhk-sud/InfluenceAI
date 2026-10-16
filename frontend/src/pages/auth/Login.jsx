import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showToast } from '../../components/common/Toast';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const role = authService.getCurrentRole();
      if (role === 'Company' || role === 'brand') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/influencer/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your registered email address and password.');
      showToast('Please fill in all credentials.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Unified login: automatically identifies Brand vs Influencer from account profile
      const user = await authService.login(email, password);
      showToast(`Welcome back, ${user.name || 'User'}!`, 'success');

      // Auto-redirect according to user role
      if (user.role === 'Company' || user.role === 'brand') {
        navigate('/company/dashboard');
      } else {
        navigate('/influencer/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Only registered users can sign in.';
      setErrorMessage(msg);
      showToast(msg, 'error');
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
        position: 'relative'
      }}
    >
      {/* Brand logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginBottom: '32px'
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
            fontSize: '20px'
          }}
        >
          ⚡
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Influence<span style={{ color: 'var(--primary-purple)' }}>AI</span>
        </span>
      </div>

      {/* Main Unified Login Card */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '6px', textAlign: 'center' }}>
          Sign In to InfluenceAI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '24px', textAlign: 'center' }}>
          Enter your registered email and password to access your dashboard.
        </p>

        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '18px',
              lineHeight: 1.4
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  outline: 'none'
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
                  outline: 'none'
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
                  alignItems: 'center'
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
              cursor: 'pointer'
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
                  animation: 'spin 0.6s linear infinite'
                }}
              />
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '28px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Don't have a registered account yet?{' '}
          <span
            onClick={() => navigate('/select-role')}
            style={{ color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
