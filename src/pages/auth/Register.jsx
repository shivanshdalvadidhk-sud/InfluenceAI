import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showToast } from '../../components/common/Toast';
import { INDIAN_STATES } from '../../data/mockData';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, Building, Globe, MapPin } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Company'); // Company or Influencer
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('Fashion');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [website, setWebsite] = useState('');
  
  // Influencer fields
  const [fullName, setFullName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [channelHandle, setChannelHandle] = useState('');
  const [creatorState, setCreatorState] = useState('Karnataka');

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Content Categories Niches
  const creatorCategories = [
    'Technology', 'Fashion & Lifestyle', 'Gaming', 'Finance', 'Fitness', 
    'Education', 'Food', 'Travel', 'Comedy', 'Music', 'Entertainment', 
    'Beauty', 'Automobile', 'Art & Craft'
  ];

  useEffect(() => {
    const selectedRole = localStorage.getItem('influenceai_register_role');
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, []);

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('influenceai_register_role', selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please agree to the Terms of Service & Privacy Policy.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (role === 'Company') {
        const data = { email, password, companyName, brandName, industry, city, state, website };
        await authService.registerCompany(data);
        showToast('Company account registered successfully!', 'success');
        navigate('/company/dashboard');
      } else {
        // Influencer - set default properties for removed/hidden fields
        const data = { 
          email, 
          password, 
          fullName, 
          creatorName, 
          primaryPlatform: 'YouTube', 
          category, 
          language: 'English', // will configure all selection in profile
          channelHandle, 
          city: '', // headquarters city removed
          state: creatorState 
        };
        await authService.registerInfluencer(data);
        showToast('Creator account registered successfully!', 'success');
        navigate('/influencer/dashboard');
      }
    } catch (err) {
      showToast('Registration failed. Try again.', 'error');
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
        padding: '40px 24px',
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
          maxWidth: '560px',
          boxShadow: 'var(--shadow-premium)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
          Create your Account
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
          Join the graph recommendation system for verified campaigns.
        </p>

        {/* Role Toggle Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleToggle('Company')}
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
            onClick={() => handleRoleToggle('Influencer')}
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
          {/* Conditional Form Inputs */}
          {role === 'Company' ? (
            <>
              {/* BRAND FIELDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Google Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <Building size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand Name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Pixel Devices"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <Building size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Industry Category</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
                  >
                    <option value="Fashion">Fashion & Lifestyle</option>
                    <option value="Technology">Technology</option>
                    <option value="Fitness">Fitness & Sports</option>
                    <option value="Gaming">Gaming & Gaming Rig</option>
                    <option value="Finance">Finance & Investing</option>
                    <option value="Travel">Travel & Tourism</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand Website</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="url"
                      placeholder="https://brand.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <Globe size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>
              </div>

              {/* COMPANY ADDRESS FIELDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Headquarters City *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <MapPin size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>State / UT *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* INFLUENCER FIELDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Amit Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <User size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Creator Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Amit Plays Tech"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <User size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Channel Handle *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="@amit_tech"
                      value={channelHandle}
                      onChange={(e) => setChannelHandle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <Globe size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Niche Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
                  >
                    {creatorCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CREATOR REGION FIELD */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Creator Location State / UT *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={creatorState}
                    onChange={(e) => setCreatorState(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <MapPin size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
                </div>
              </div>
            </>
          )}

          {/* BASIC CREDENTIALS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Business Email Address *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="office@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
              <Mail size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Secure Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 40px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              style={{ cursor: 'pointer', width: '16px', height: '16px', marginTop: '2px' }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.3 }}>
              I agree to the InfluenceAI <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>Privacy Policy</span>.
            </label>
          </div>

          {/* Submit */}
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
              marginTop: '8px',
            }}
          >
            {loading ? (
              <span>Registering account...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Create verified profile</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer' }}>
            Sign In here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
