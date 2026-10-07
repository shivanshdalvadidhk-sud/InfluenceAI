import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { influencerService } from '../../services/influencerService';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Bookmark,
  History,
  BarChart3,
  User,
  Bell,
  Settings,
  LogOut,
  Mail,
  X
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const role = authService.getCurrentRole();

  const [savedCount, setSavedCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);

  const loadCounts = async () => {
    try {
      if (role === 'Company') {
        const saved = await influencerService.getSavedInfluencers();
        setSavedCount(saved ? saved.length : 0);
      } else {
        const list = await influencerService.getInquiries();
        const newInqs = list ? list.filter((i) => i.status === 'New') : [];
        setInquiryCount(newInqs.length);
      }
    } catch (err) {
      console.error("Error loading sidebar badge counts:", err);
    }
  };

  useEffect(() => {
    loadCounts();

    const handleSavedChange = () => loadCounts();
    const handleInquiriesChange = () => loadCounts();

    window.addEventListener('influenceai_saved_changed', handleSavedChange);
    window.addEventListener('influenceai_inquiries_changed', handleInquiriesChange);

    return () => {
      window.removeEventListener('influenceai_saved_changed', handleSavedChange);
      window.removeEventListener('influenceai_inquiries_changed', handleInquiriesChange);
    };
  }, [role]);

  const handleLogout = () => {
    authService.logout();
    if (onClose) onClose();
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const getBrandMenuItems = () => [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { name: 'Create Campaign', path: '/company/campaigns/create', icon: PlusCircle },
    { name: 'Recommendations', path: '/company/recommendations', icon: Sparkles },
    { name: 'Saved Influencers', path: '/company/saved', icon: Bookmark, badge: savedCount },
    { name: 'Campaign History', path: '/company/campaigns/history', icon: History },
    { name: 'Analytics', path: '/company/analytics', icon: BarChart3 },
    { name: 'Company Profile', path: '/company/profile', icon: User },
    { name: 'Notifications', path: '/company/notifications', icon: Bell },
    { name: 'Settings', path: '/company/settings', icon: Settings },
  ];

  const getInfluencerMenuItems = () => [
    { name: 'Dashboard', path: '/influencer/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/influencer/profile', icon: User },
    { name: 'Campaign Inquiries', path: '/influencer/inquiries', icon: Mail, badge: inquiryCount },
    { name: 'Saved Opportunities', path: '/influencer/saved', icon: Bookmark },
    { name: 'Notifications', path: '/influencer/notifications', icon: Bell },
    { name: 'Settings', path: '/influencer/settings', icon: Settings },
  ];

  const menuItems = role === 'Company' ? getBrandMenuItems() : getInfluencerMenuItems();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
            transition: 'opacity 0.3s ease',
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1050,
          padding: '24px 16px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
          }}
          className="sidebar-close-btn"
        >
          <X size={20} />
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '36px',
            paddingLeft: '8px',
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
              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
            }}
          >
            ⚡
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
                fontFamily: 'var(--font-heading)',
                margin: 0,
              }}
            >
              Influence<span style={{ color: 'var(--primary-purple)' }}>AI</span>
            </h1>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'var(--text-light)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Enterprise Platform
            </span>
          </div>
        </div>

        {/* Menu Header Label */}
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            paddingLeft: '12px',
            marginBottom: '16px',
          }}
        >
          Menu
        </span>

        {/* Navigation Links */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexGrow: 1,
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)',
                  position: 'relative',
                }}
                className={isActive ? '' : 'sidebar-btn-hover'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? 'var(--primary-purple)' : 'var(--text-light)',
                      transition: 'color 0.2s ease',
                    }}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--primary-purple)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '20px',
                      padding: '2px 6px',
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {item.badge}
                  </div>
                )}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: '4px',
                      backgroundColor: 'var(--primary-purple)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Action */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '16px',
            marginTop: 'auto',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: 'var(--accent-red)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <style>{`
          .sidebar-btn-hover:hover {
            background-color: var(--border-light) !important;
            color: var(--text-primary) !important;
          }
          .sidebar-btn-hover:hover svg {
            color: var(--text-secondary) !important;
          }
          .sidebar-close-btn {
            display: none;
          }

          @media (max-width: 960px) {
            .app-sidebar {
              transform: translateX(-100%);
            }
            .app-sidebar.mobile-open {
              transform: translateX(0) !important;
            }
            .sidebar-close-btn {
              display: block !important;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
