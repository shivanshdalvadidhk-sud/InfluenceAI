import React from 'react';

const MatchBadge = ({ score, label = 'AI Match', size = 'md' }) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  
  const padding = isSmall ? '3px 8px' : isLarge ? '8px 18px' : '5px 12px';
  const fontSize = isSmall ? '0.7rem' : isLarge ? '1rem' : '0.8rem';
  const iconSize = isSmall ? '10px' : isLarge ? '16px' : '12px';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--gradient-ai)',
        color: 'white',
        fontWeight: 700,
        borderRadius: '24px',
        padding,
        fontSize,
        fontFamily: 'var(--font-heading)',
        boxShadow: '0 4px 10px rgba(168, 85, 247, 0.25)',
      }}
    >
      <span style={{ fontSize: iconSize }}>✨</span>
      <span>{label} {score}%</span>
    </div>
  );
};

export default MatchBadge;
