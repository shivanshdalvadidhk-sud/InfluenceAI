import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { showToast } from '../components/common/Toast';
import { Settings as SettingsIcon, Shield, Bell, Eye, Save } from 'lucide-react';

const Settings = () => {
  const [emailNotice, setEmailNotice] = useState(true);
  const [matchNotice, setMatchNotice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('Preferences updated successfully.', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Confirm password does not match.', 'error');
      return;
    }
    showToast('Credentials updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Account Settings"
        subtitle="Manage secure credentials, toggle notification configurations and theme sets."
        icon={<SettingsIcon size={22} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="settings-split">
        
        {/* Left card: Preferences */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Bell size={16} style={{ color: 'var(--primary-purple)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>System Preferences</h3>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Toggle 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Email Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive inquiries and briefs reports in inbox.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotice}
                onChange={(e) => setEmailNotice(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Toggle 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Match alerts</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive notices when candidate match scores exceed 90%.</span>
              </div>
              <input
                type="checkbox"
                checked={matchNotice}
                onChange={(e) => setMatchNotice(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Toggle 3 */}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'white' }}
              >
                <option value="English">English</option>
                
                
              </select>
            </div>

            <button type="submit" className="button-gradient" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '10px' }}>
              <Save size={14} />
              <span>Save Preferences</span>
            </button>

          </form>
        </div>

        {/* Right card: Security */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <Shield size={16} style={{ color: 'var(--primary-purple)' }} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Account Credentials Security</h3>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} />
            </div>

            <button type="submit" className="button-gradient" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '10px' }}>
              <Shield size={14} />
              <span>Update Credentials</span>
            </button>

          </form>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .settings-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
