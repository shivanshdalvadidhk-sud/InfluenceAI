import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

// Global helper to trigger toast notifications from any JS file
export const showToast = (message, type = 'success') => {
  window.dispatchEvent(
    new CustomEvent('influenceai_toast', {
      detail: { message, type }
    })
  );
};

const Toast = () => {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type } = e.detail;
      setToast({ message, type });
      setVisible(true);
    };

    window.addEventListener('influenceai_toast', handleToastEvent);
    return () => window.removeEventListener('influenceai_toast', handleToastEvent);
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, toast]);

  if (!toast || !visible) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          icon: <AlertTriangle size={18} color="#EF4444" />
        };
      case 'info':
        return {
          bg: '#F0F9FF',
          border: '1px solid #93C5FD',
          color: '#1E3A8A',
          icon: <Info size={18} color="#3B82F6" />
        };
      default: // success
        return {
          bg: '#ECFDF5',
          border: '1px solid #6EE7B7',
          color: '#065F46',
          icon: <CheckCircle2 size={18} color="#10B981" />
        };
    }
  };

  const style = getStyle();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: style.bg,
        border: style.border,
        color: style.color,
        padding: '12px 18px',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-premium)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        fontWeight: 500,
        maxWidth: '360px',
        animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>{style.icon}</div>
      <div style={{ flexGrow: 1, paddingRight: '8px', lineHeight: 1.3 }}>{toast.message}</div>
      <button
        onClick={() => setVisible(false)}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'inherit',
          opacity: 0.6,
          padding: '2px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
