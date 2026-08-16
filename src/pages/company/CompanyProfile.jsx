import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { authService } from '../../services/authService';
import { showToast } from '../../components/common/Toast';
import { User, Building, Globe, Mail, Phone, MapPin, Save } from 'lucide-react';
import { INDIAN_STATES } from '../../data/mockData';

const CompanyProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // States for inputs
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [established, setEstablished] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  const [description, setDescription] = useState('');
  

  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [x, setX] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCompanyName(user.name || '');
      setBrandName(user.brandName || '');
      setEstablished(user.established || '');
      setIndustry(user.industry || 'Fashion');
      setWebsite(user.website || '');
      setEmail(user.email || '');
      setPhone(user.phone || '+91 98765 43210');
      setCity(user.city || '');
      setState(user.state || '');
      setCountry(user.country || 'India');
      setDescription(user.description || '');
      

      setYoutube(user.socials?.youtube || '');
      setLinkedin(user.socials?.linkedin || '');
      setX(user.socials?.x || '');
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      name: companyName,
      brandName,
      established,
      industry,
      website,
      email,
      phone,
      city,
      state,
      country,
      description,
      socials: { youtube, linkedin, x }
    };

    authService.updateProfile(updated);
    showToast('Brand profile details updated successfully.', 'success');
  };

  if (!currentUser) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Brand Profile"
        subtitle="Manage your company identity, headquarters location, contact details & social channels."
        icon={<User size={22} />}
      />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core details card */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Building size={16} style={{ color: 'var(--primary-purple)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Company Logo & Core Details</h3>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Logo box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <img src={currentUser.avatar} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              <button type="button" style={{ border: 'none', background: 'none', color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Upload Logo</button>
            </div>

            {/* Inputs grid */}
            <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name *</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand Name *</label>
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year Established *</label>
                <input type="number" value={established} onChange={(e) => setEstablished(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Industry Category</label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'white' }}>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Technology">Technology & Software</option>
                  <option value="Gaming">Gaming & Hardware</option>
                  <option value="Finance">Finance & Investing</option>
                  <option value="Fitness">Fitness & Wellness</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and HQ card */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Contact & Headquarters</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Website</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
                <Globe size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Business Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
                <Mail size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
                <Phone size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-light)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Headquarters City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'white' }}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* Bio card */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Brand Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
        </div>

        {/* Social channels card */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Social Channels</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Channel</label>
              <input type="text" value={youtube} onChange={(e) => setYoutube(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LinkedIn Page</label>
              <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>X / Twitter</label>
              <input type="text" value={x} onChange={(e) => setX(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="button-gradient" style={{ padding: '14px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            <span>Save Profile Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default CompanyProfile;
