import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';
import { INDIAN_STATES, INDIAN_CITIES, INDIAN_CITIES_BY_STATE } from '../../data/mockData';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, Building, Globe, MapPin, AlertCircle, Video, CheckCircle2, RefreshCw } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Company'); // Company or Influencer
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('Fashion');
  const [state, setState] = useState('Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [website, setWebsite] = useState('');
  
  // Influencer fields
  const [fullName, setFullName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [channelHandle, setChannelHandle] = useState('');
  const [channelLinkOrId, setChannelLinkOrId] = useState('');
  const [creatorState, setCreatorState] = useState('Karnataka');
  const [channelPreview, setChannelPreview] = useState(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');
    localStorage.setItem('influenceai_register_role', selectedRole);
  };

  const handleStateChange = (newState) => {
    setState(newState);
    const stateCities = INDIAN_CITIES_BY_STATE[newState] || [];
    if (stateCities.length > 0 && !stateCities.includes(city)) {
      setCity(stateCities[0]);
    }
  };

  const handleCityChange = (newCity) => {
    setCity(newCity);
    const currentStateCities = INDIAN_CITIES_BY_STATE[state] || [];
    if (!currentStateCities.includes(newCity)) {
      const matchedState = Object.keys(INDIAN_CITIES_BY_STATE).find((st) =>
        (INDIAN_CITIES_BY_STATE[st] || []).includes(newCity)
      );
      if (matchedState) {
        setState(matchedState);
      }
    }
  };

  const fetchChannelPreview = async (inputVal) => {
    const raw = String(inputVal || '').trim();
    if (!raw || raw.length < 3) {
      setChannelPreview(null);
      setPreviewError('');
      return;
    }

    setFetchingPreview(true);
    setPreviewError('');
    try {
      const res = await api.get(`/channels/preview?input=${encodeURIComponent(raw)}`);
      if (res.data?.success && res.data.channel) {
        const ch = res.data.channel;
        setChannelPreview(ch);
        setPreviewError('');

        // Auto-populate creator details
        if (ch.channel_title) {
          setCreatorName(ch.channel_title);
          if (!fullName) setFullName(ch.channel_title);
        }
        if (ch.custom_url) {
          setChannelHandle(ch.custom_url.startsWith('@') ? ch.custom_url : `@${ch.custom_url}`);
        } else if (ch.channel_id) {
          setChannelHandle(ch.channel_id);
        }
        if (ch.category && creatorCategories.includes(ch.category)) {
          setCategory(ch.category);
        }
      } else {
        setPreviewError('Channel not found or YouTube API did not return data for this input.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message;
      setPreviewError(msg || 'Could not fetch channel details.');
    } finally {
      setFetchingPreview(false);
    }
  };

  useEffect(() => {
    if (role !== 'Influencer') return;
    const timer = setTimeout(() => {
      if (channelLinkOrId.trim().length >= 3) {
        fetchChannelPreview(channelLinkOrId);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [channelLinkOrId, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = String(email || '').trim().toLowerCase();
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email && currentUser.email.trim().toLowerCase() === cleanEmail) {
      const msg = 'This email is already logged in and registered. Signup denied — please use a different email address.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (!agreeTerms) {
      const msg = 'Please agree to the Terms of Service & Privacy Policy.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (String(password).length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      if (role === 'Company') {
        const data = {
          email: cleanEmail,
          password,
          companyName: companyName.trim(),
          brandName: (brandName || companyName).trim(),
          industry,
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          website: website.trim()
        };
        await authService.registerCompany(data);
        showToast('Company account registered successfully!', 'success');
        navigate('/company/dashboard');
      } else {
        const finalHandle = (channelHandle || channelPreview?.custom_url || channelPreview?.channel_id || channelLinkOrId).trim();
        const finalCreatorName = (creatorName || channelPreview?.channel_title || fullName || 'Creator').trim();
        const data = { 
          email: cleanEmail, 
          password, 
          fullName: (fullName || finalCreatorName).trim(), 
          creatorName: finalCreatorName, 
          primaryPlatform: 'YouTube', 
          category, 
          language: 'English',
          channelHandle: finalHandle, 
          avatar: channelPreview?.thumbnail_url || null,
          subscribers: Number(channelPreview?.subscriber_count || 0),
          avgViews: channelPreview?.view_count ? Math.round(Number(channelPreview.view_count) / Math.max(1, Number(channelPreview.video_count || 50))) : 0,
          city: '',
          state: creatorState 
        };
        await authService.registerInfluencer(data);
        showToast('Creator account registered successfully with YouTube avatar!', 'success');
        navigate('/influencer/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const stateCitiesList = INDIAN_CITIES_BY_STATE[state] || [];
  const otherCitiesList = INDIAN_CITIES.filter((c) => !stateCitiesList.includes(c));

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
            marginBottom: '24px',
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

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '20px',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

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
                      type="text"
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
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
                    >
                      {stateCitiesList.length > 0 && (
                        <optgroup label={`${state} Cities`}>
                          {stateCitiesList.map((c) => (
                            <option key={`${state}-${c}`} value={c}>{c}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="All Indian Cities">
                        {otherCitiesList.map((c) => (
                          <option key={`all-${c}`} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    </select>
                    <MapPin size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>State / UT *</label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
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
              {/* YOUTUBE CHANNEL LINK / ID INPUT & AUTO-FETCH */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    YouTube Channel Link or Channel ID *
                  </label>
                  {fetchingPreview && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-purple)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      Fetching YouTube profile...
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/@AmitEdutec or UC_gtN4lepSR1ebO2fKGd85g"
                      value={channelLinkOrId}
                      onChange={(e) => setChannelLinkOrId(e.target.value)}
                      onBlur={() => {
                        if (channelLinkOrId.trim().length >= 3 && !channelPreview) {
                          fetchChannelPreview(channelLinkOrId);
                        }
                      }}
                      required
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                    />
                    <Video size={16} style={{ position: 'absolute', left: 12, color: 'var(--accent-red)' }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchChannelPreview(channelLinkOrId)}
                    disabled={fetchingPreview || !channelLinkOrId.trim()}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--primary-purple)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Auto Fetch
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Paste your full YouTube channel link or Channel ID. Your real YouTube profile photo, title, and subscriber stats will be fetched automatically.
                </span>
              </div>

              {/* AUTOMATIC YOUTUBE PROFILE PHOTO & CHANNEL PREVIEW CARD */}
              {channelPreview && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={channelPreview.thumbnail_url}
                        alt={channelPreview.channel_title}
                        referrerPolicy="no-referrer"
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #22C55E'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          backgroundColor: '#EF4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        <Video size={10} color="white" />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {channelPreview.channel_title}
                        </strong>
                        <CheckCircle2 size={15} color="#16A34A" />
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block' }}>
                        {channelPreview.custom_url || channelPreview.channel_id}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 600 }}>
                        {Number(channelPreview.subscriber_count || 0).toLocaleString('en-IN')} subscribers • {Number(channelPreview.video_count || 0)} videos
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '4px 10px',
                      borderRadius: '16px'
                    }}
                  >
                    YouTube Profile Photo Synced
                  </span>
                </div>
              )}

              {previewError && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: '#92400E'
                  }}
                >
                  {previewError}
                </div>
              )}

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
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Channel Handle / URL</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="@AmitEdutec"
                      value={channelHandle}
                      onChange={(e) => setChannelHandle(e.target.value)}
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
                  <MapPin size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)', pointerEvents: 'none' }} />
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
                minLength={6}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '10px 40px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
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

