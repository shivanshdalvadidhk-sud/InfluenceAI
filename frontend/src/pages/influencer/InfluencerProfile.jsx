import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { authService } from '../../services/authService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { INDIAN_STATES } from '../../data/mockData';
import { User, Video, Radio, DollarSign, Save } from 'lucide-react';

const InfluencerProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // States
  const [fullName, setFullName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [bio, setBio] = useState('');
  const [state, setState] = useState('Karnataka');

  // YouTube stats
  const [handle, setHandle] = useState('');
  const [subscribers, setSubscribers] = useState(0);
  const [avgViews, setAvgViews] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [category, setCategory] = useState('Technology');

  // Rates
  const [rateStarting, setRateStarting] = useState(0);
  const [rateDedicated, setRateDedicated] = useState(0);
  const [rateIntegrated, setRateIntegrated] = useState(0);
  const [rateShort, setRateShort] = useState(0);

  // Multi categories
  const categoriesList = [
    'Technology', 'Fashion & Lifestyle', 'Gaming', 'Finance', 'Fitness', 
    'Education', 'Food', 'Travel', 'Comedy', 'Music', 'Entertainment', 
    'Beauty', 'Automobile', 'Art & Craft'
  ];
  const [selectedCategories, setSelectedCategories] = useState(['Technology']);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setFullName(user.name || '');
      setCreatorName(user.creatorName || '');
      setBio(user.bio || '');
      setState(user.state || 'Karnataka');

      setHandle(user.handle || '');
      setSubscribers(user.subscribers || 0);
      setAvgViews(user.avgViews || 0);
      setEngagement(user.engagementRate || 0);
      setCategory(user.category || 'Technology');
      setSelectedCategories([user.category || 'Technology']);

      const price = user.priceRates || {};
      setRateStarting(price.starting || 0);
      setRateDedicated(price.dedicated || 0);
      setRateIntegrated(price.integrated || 0);
      setRateShort(price.short || 0);
    }
  }, []);

  const handleCategoryToggle = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);

    const updatedData = {
      name: fullName,
      creatorName,
      bio,
      state,
      languages: currentUser.languages || ['English'],
      language: currentUser.language || 'English',
      primaryPlatform: 'YouTube',
      handle,
      subscribers: Number(subscribers),
      avgViews: Number(avgViews),
      engagementRate: Number(engagement),
      category: selectedCategories.length > 0 ? selectedCategories[0] : category,
      priceRates: {
        starting: Number(rateStarting),
        dedicated: Number(rateDedicated),
        integrated: Number(rateIntegrated),
        short: Number(rateShort)
      },
      avatar: currentUser.avatar
    };

    try {
      const savedUser = await influencerService.updateProfile(updatedData);
      setCurrentUser(savedUser);
      showToast('Profile updated & synced to Supabase database successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Influencer Account Profile"
        subtitle="Update your channel metrics, content categories, and collaboration rate cards."
        icon={<User size={22} />}
      />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Personal basic information */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Radio size={16} style={{ color: 'var(--primary-purple)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Creator Identity Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Legal Name *</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Creator / Public Screen Name *</label>
              <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>State / UT *</label>
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'white' }}>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Biography & Channel Description *</label>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
          </div>
        </div>

        {/* YouTube Channel connection stats */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Video size={16} style={{ color: 'var(--accent-red)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>YouTube Channel Verification & Stats</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Channel Handle / URL *</label>
              <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Channel Subscribers *</label>
              <input type="number" value={subscribers} onChange={(e) => setSubscribers(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Average Views per Video *</label>
              <input type="number" value={avgViews} onChange={(e) => setAvgViews(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Engagement Rate (%) *</label>
              <input type="number" step="0.1" value={engagement} onChange={(e) => setEngagement(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* Content categories niches */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Content Niches Categories</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {categoriesList.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--primary-purple)' : 'white',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate Cards pricing */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <DollarSign size={16} style={{ color: 'var(--accent-green)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Collaboration Rate Cards (₹)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Starting Collaboration Rate *</label>
              <input type="number" value={rateStarting} onChange={(e) => setRateStarting(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dedicated Video Fee *</label>
              <input type="number" value={rateDedicated} onChange={(e) => setRateDedicated(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Integrated Video segment Fee *</label>
              <input type="number" value={rateIntegrated} onChange={(e) => setRateIntegrated(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Short / Reel Video Fee *</label>
              <input type="number" value={rateShort} onChange={(e) => setRateShort(Number(e.target.value))} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            className="button-gradient"
            style={{ padding: '14px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving to Database...' : 'Save Profile Revisions'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default InfluencerProfile;
