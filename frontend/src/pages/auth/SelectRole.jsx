import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Sparkles, User2, ArrowRight } from 'lucide-react';

const SelectRole = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('influenceai_register_role', role);
    navigate('/register');
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
          marginBottom: '36px',
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
          maxWidth: '560px',
          boxShadow: 'var(--shadow-premium)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
          Choose Your Account Type
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '32px' }}>
          Connect as a Brand to find creators, or connect as a Creator to monetize your channel.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Brand Role Card */}
          <div
            onClick={() => handleRoleSelect('Company')}
            style={{
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            className="role-card-hover"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Brand / Company</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Search influencers, analyze channels demographics, run PageRank algorithms, and launch sponsorships.
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-light)' }} />
          </div>

          {/* Influencer Role Card */}
          <div
            onClick={() => handleRoleSelect('Influencer')}
            style={{
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            className="role-card-hover"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User2 size={24} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Influencer / Creator</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Build your portfolio profile, analyze brand compatibility, toggle pricing slots, and accept direct sponsorships.
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-light)' }} />
          </div>
        </div>

        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer' }}
          >
            Log In
          </span>
        </div>
      </div>

      <style>{`
        .role-card-hover:hover {
          border-color: var(--primary-purple) !important;
          background-color: var(--primary-light) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
};

export default SelectRole;
