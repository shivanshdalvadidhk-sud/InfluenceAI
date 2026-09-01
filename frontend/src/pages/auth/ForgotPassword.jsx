import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/common/Toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSuccess(true);
    showToast('Reset link dispatched to email.', 'info');
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
      {/* Brand logo */}
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
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            marginBottom: '20px',
            padding: 0,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>

        {!success ? (
          <>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              Recover Your Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.4 }}>
              Enter your registered email below and we will send you a secure link to reset your account credentials.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-light)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button-gradient"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
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
                    <Send size={16} />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-purple)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '24px',
              }}
            >
              ✉️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              Check Your Inbox
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
              We have dispatched instructions to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              If you don't receive it shortly, please verify your spam directory.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              style={{
                padding: '10px 20px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Try Another Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
