import React, { useState, useEffect } from 'react';

const Notification = ({ type = 'info', message, onClose, autoClose = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [message, autoClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!message) return null;

  const getWeatherStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          secondaryBg: 'rgba(255, 255, 255, 0.15)',
          icon: '☀️',
          color: '#fff',
          shadowColor: 'rgba(102, 126, 234, 0.4)',
          particles: '✨',
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          secondaryBg: 'rgba(255, 255, 255, 0.15)',
          icon: '🌩️',
          color: '#fff',
          shadowColor: 'rgba(245, 87, 108, 0.4)',
          particles: '⚡',
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          secondaryBg: 'rgba(255, 255, 255, 0.2)',
          icon: '⛅',
          color: '#8B4513',
          shadowColor: 'rgba(252, 182, 159, 0.4)',
          particles: '🌤️',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          secondaryBg: 'rgba(255, 255, 255, 0.2)',
          icon: '🌫️',
          color: '#2c3e50',
          shadowColor: 'rgba(168, 237, 234, 0.4)',
          particles: '💫',
        };
    }
  };

  const { background, secondaryBg, icon, color, shadowColor, particles } = getWeatherStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        transform: `translateX(${isVisible && !isClosing ? '0' : '400px'}) scale(${isVisible && !isClosing ? '1' : '0.8'})`,
        opacity: isVisible && !isClosing ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }}
    >
      <div
        style={{
          minWidth: '320px',
          maxWidth: '400px',
          background,
          color,
          padding: '1.25rem',
          borderRadius: '20px',
          boxShadow: `0 20px 40px ${shadowColor}, 0 4px 8px rgba(0, 0, 0, 0.1)`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          fontSize: '0.95rem',
          fontWeight: '500',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background particles */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            opacity: 0.1,
            animation: 'float 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          {particles.repeat(8)}
        </div>

        {/* Icon container with pulsing animation */}
        <div
          style={{
            fontSize: '2rem',
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: secondaryBg,
            borderRadius: '12px',
            animation: 'pulse 2s ease-in-out infinite',
            backdropFilter: 'blur(10px)',
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingTop: '2px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              opacity: 0.9,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
            }}
          >
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}
          </div>
          <div style={{ lineHeight: '1.4' }}>{message}</div>
        </div>

        {/* Enhanced close button */}
        <button
          onClick={handleClose}
          style={{
            background: secondaryBg,
            border: 'none',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            color: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '2px',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = secondaryBg;
          }}
        >
          ×
        </button>

        {/* Progress bar for auto-close */}
        {autoClose > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '0 0 20px 20px',
              animation: `progress ${autoClose}ms linear`,
              transformOrigin: 'left',
            }}
          />
        )}

        {/* CSS animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes progress {
            0% { width: 100%; }
            100% { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Notification;
