import React from 'react';

const StatCard = ({ label, value, trend, trendType = 'positive', icon, style }) => {
  const isPositive = trendType === 'positive';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '220px',
        ...style
      }}
      className="card-hover-lift"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            letterSpacing: '1px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
              }}
            >
              {trend}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>vs last month</span>
          </div>
        )}
      </div>

      {icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
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
    </div>
  );
};

export default StatCard;
