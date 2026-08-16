import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { influencerService } from '../../services/influencerService';
import { Bell, Search, Home, ChevronRight, User as UserIcon } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const role = authService.getCurrentRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotificationCounts = async () => {
    const list = await influencerService.getInquiries();
    if (role === 'Company') {
      // simulate notification: e.g. count inquiries that are New or Interested
      setInquiryCount(list.length);
    } else {
      const newInqs = list.filter((i) => i.status === 'New');
      setInquiryCount(newInqs.length);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
    window.addEventListener('influenceai_inquiries_changed', fetchNotificationCounts);
    return () => {
      window.removeEventListener('influenceai_inquiries_changed', fetchNotificationCounts);
    };
  }, [role]);

  // Handle clicking outside of search suggestion dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on user search
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 1) {
      if (role === 'Company') {
        const list = await influencerService.getInfluencers();
        const filtered = list.filter(
          (i) =>
            i.name.toLowerCase().includes(val.toLowerCase()) ||
            i.handle.toLowerCase().includes(val.toLowerCase()) ||
            i.category.toLowerCase().includes(val.toLowerCase()) ||
            i.state.toLowerCase().includes(val.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
      } else {
        // Influencer searches for opportunities or categories
        const suggestionsMock = [
          { id: 'tech', name: 'Technology Opportunities', handle: 'Campaigns' },
          { id: 'fashion', name: 'Fashion Brand Deals', handle: 'Campaigns' },
          { id: 'aura', name: 'Aura Lifestyle Campaigns', handle: 'Brand Partner' }
        ].filter(s => s.name.toLowerCase().includes(val.toLowerCase()));
        setSuggestions(suggestionsMock);
      }
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery('');
    setShowDropdown(false);
    if (role === 'Company') {
      navigate(`/company/influencers/${item.id}`);
    } else {
      navigate('/influencer/opportunities');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      if (role === 'Company') {
        navigate(`/company/recommendations?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/influencer/opportunities?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Build Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    if (paths.length === 0) return [{ name: 'Home', active: true }];

    const breadcrumbs = [{ name: 'Home', path: role === 'Company' ? '/company/dashboard' : '/influencer/dashboard' }];
    
    let currentPath = '';
    paths.forEach((p, idx) => {
      currentPath += `/${p}`;
      
      // format title
      let name = p.charAt(0).toUpperCase() + p.slice(1);
      if (name === 'Company') return; // Skip base role identifier
      if (name === 'Influencer') return;
      if (name === 'Campaigns') name = 'Campaign';
      if (name === 'Inquiries') name = 'Brand Inquiries';
      
      // Handle details UUIDs
      if (p.includes('-') || (idx === paths.length - 1 && !isNaN(p))) {
        name = 'Detail View';
      }

      breadcrumbs.push({
        name,
        path: currentPath,
        active: idx === paths.length - 1
      });
    });

    return breadcrumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <div
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-navbar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 'var(--sidebar-width)',
        zIndex: 900,
        boxShadow: 'var(--shadow-sm)',
        transition: 'left var(--transition-normal)',
      }}
      className="navbar-responsive"
    >
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => navigate(role === 'Company' ? '/company/dashboard' : '/influencer/dashboard')}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Home size={16} />
        </button>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} style={{ color: 'var(--text-light)' }} />}
            <span
              onClick={() => !crumb.active && navigate(crumb.path)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: crumb.active ? 600 : 500,
                color: crumb.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: crumb.active ? 'default' : 'pointer',
              }}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Search Bar Container */}
      <div style={{ position: 'relative', width: '380px' }} ref={dropdownRef} className="navbar-search">
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder={
                role === 'Company'
                  ? "Search YouTubers, handles, niches..."
                  : "Search brands, campaigns, categories..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              style={{
                width: '100%',
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '24px',
                padding: '10px 16px 10px 42px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onFocusCapture={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              onBlurCapture={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 16,
                color: 'var(--text-light)',
              }}
            />
          </div>
        </form>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-premium)',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 950,
            }}
          >
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.avatar ? (
                    <img src={item.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={14} style={{ color: 'var(--primary-purple)' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.handle}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notifications Icon */}
        <button
          onClick={() => navigate(role === 'Company' ? '/company/notifications' : '/influencer/notifications')}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Bell size={20} />
          {inquiryCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'var(--accent-blue)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          )}
        </button>

        {/* User Card */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '1px solid var(--border-color)',
              paddingLeft: '20px',
            }}
          >
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="navbar-username">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {role === 'Company' ? 'Brand Partner' : 'Creator / Influencer'}
              </span>
            </div>
            <img
              src={user.avatar}
              alt=""
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary-light)',
                cursor: 'pointer'
              }}
              onClick={() => navigate(role === 'Company' ? '/company/profile' : '/influencer/profile')}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .navbar-responsive {
            left: 0 !important;
            padding: 0 16px !important;
          }
          .navbar-search, .navbar-username {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
