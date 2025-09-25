import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Notification from './Notification';

const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      // Login mode
      if (username === 'user' && password === '1234') {
        onLogin();
        setNotification({ type: 'success', message: 'Login successful!' });
      } else {
        setNotification({ type: 'error', message: 'Invalid credentials. Try user / 1234' });
      }
    } else {
      // Signup mode — simple validation
      if (username.length < 3 || password.length < 4) {
        setNotification({ type: 'warning', message: 'Please enter a valid name and password.' });
        return;
      }

      setNotification({ type: 'success', message: 'Account created! (UI only)' });
      setIsLogin(true);
    }
  };

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Styles (same as before)
  const wrapperStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Poppins, sans-serif',
    padding: '1rem',
  };

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    animation: 'fadeIn 0.5s ease-in-out',
  };

  const headingStyle = {
    fontWeight: 600,
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    marginBottom: '1.2rem',
  };

  const buttonStyle = {
    backgroundColor: '#ffffff',
    color: '#2c5364',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    width: '100%',
    transition: '0.3s',
  };

  const linkButtonStyle = {
    color: '#ffffff',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: '0.3rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  };

  const fadeInKeyframes = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{fadeInKeyframes}</style>

      {/* ✅ Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: '', message: '' })}
      />

      <div style={wrapperStyle}>
        <div style={glassCardStyle}>
          <h2 style={headingStyle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form autoComplete="off" onSubmit={handleSubmit}>
            {/* Username or Full Name field */}
            <input
              type="text"
              className="form-control"
              placeholder={isLogin ? 'Username' : 'Full Name'}
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Password field */}
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Submit Button */}
            <button type="submit" style={buttonStyle}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : 'Already registered?'}
            <button onClick={toggleForm} style={linkButtonStyle}>
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
