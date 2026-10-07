import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showToast } from '../../components/common/Toast';
import { Mail, ArrowLeft, Send, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: 6-Digit OTP

  // 6-digit OTP array state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const msg = await authService.forgotPassword(email);
      setStep(2);
      showToast(msg || `6-digit OTP code sent to ${email}`, 'success');
    } catch (err) {
      showToast(err.message || 'Error sending OTP code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input field
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      showToast('Please paste a valid 6-digit OTP code', 'error');
      return;
    }
    const digits = pastedData.split('');
    setOtpDigits(digits);
    inputRefs[5].current?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter all 6 digits of the OTP code.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOTP(email, otpCode);
      showToast('OTP Code Verified successfully!', 'success');
      navigate(`/reset-password?email=${encodeURIComponent(email)}&verified=true`);
    } catch (err) {
      showToast(err.message || 'Invalid 6-digit OTP code.', 'error');
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
          ⚡
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
          maxWidth: '460px',
          boxShadow: 'var(--shadow-premium)',
        }}
      >
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate('/login'))}
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
          <span>{step === 2 ? 'Change Email' : 'Back to Login'}</span>
        </button>

        {step === 1 ? (
          <>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              Forgot Password OTP
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.4 }}>
              Enter your registered email address below. We will send a secure 6-digit OTP code to your inbox.
            </p>

            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <span>Send 6-Digit OTP Code</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-purple)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <KeyRound size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                Enter 6-Digit OTP Code
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Security code dispatched to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>
            </div>


            <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 6 Digit Input Boxes */}
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      borderRadius: '10px',
                      border: digit ? '2px solid var(--primary-purple)' : '1px solid var(--border-color)',
                      backgroundColor: digit ? 'var(--primary-light)' : '#FAFAFA',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
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
                {loading ? 'Verifying OTP...' : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify OTP & Reset Password</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-purple)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Resend 6-Digit OTP</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
