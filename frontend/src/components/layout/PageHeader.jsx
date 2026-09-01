import React from 'react';

const PageHeader = ({ title, subtitle, icon, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        width: '100%',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-purple)',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center' }}>{action}</div>}
    </div>
  );
};

export default PageHeader;
