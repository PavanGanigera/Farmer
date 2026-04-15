import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const features = [
  { icon: '📊', text: 'Live Mandi prices for 50+ crops' },
  { icon: '🤖', text: 'AI-powered price predictions' },
  { icon: '💰', text: 'Income & expense tracker' },
  { icon: '🏦', text: 'Micro-loans & crop insurance' },
  { icon: '🛒', text: 'Direct buyer marketplace' },
];

export default function Login({ onSwitch, onForgot }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/^\d{10}$/.test(phone)) e.phone = 'Enter a valid 10-digit mobile number.';
    if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // simulated delay
      await login(phone, password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left Branding Panel */}
      <div className="auth-left">
        <div className="auth-logo">🚜</div>
        <h1 className="auth-left-title">Agri<span>Smart</span></h1>
        <p className="auth-left-desc">
          India's smartest financial toolkit for farmers — built to protect your income and grow your wealth.
        </p>
        <div className="auth-features">
          {features.map((f) => (
            <div key={f.text} className="auth-feature-item">
              <span className="feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-form-header">
          <h1>Welcome back 👋</h1>
          <p>Sign in to your AgriSmart account to continue.</p>
        </div>

        {error && (
          <div className="auth-global-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Phone */}
          <div className="auth-form-group">
            <label htmlFor="login-phone">Mobile Number</label>
            <div className="auth-input-wrap">
              <Phone size={17} className="input-icon" />
              <input
                id="login-phone"
                type="tel"
                className={`auth-input ${errors.phone ? 'has-error' : ''}`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setErrors({ ...errors, phone: '' }); }}
              />
            </div>
            {errors.phone && <p className="auth-error-msg"><AlertCircle size={13} />{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label htmlFor="login-password" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <button type="button" className="auth-footer-link" style={{ display: 'inline', textAlign: 'right', marginTop: 0 }} onClick={onForgot}>
                <span style={{ color: '#10b981', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', padding: 0 }}>Forgot password?</span>
              </button>
            </label>
            <div className="auth-input-wrap">
              <Lock size={17} className="input-icon" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className={`auth-input padded-right ${errors.password ? 'has-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="auth-error-msg"><AlertCircle size={13} />{errors.password}</p>}
          </div>

          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button type="button" className="auth-btn auth-btn-outline" onClick={() => toast.success('Google Sign-In coming soon!')}>
          <svg style={{ width: 20, height: 20, marginRight: '8px', verticalAlign: 'middle' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="auth-footer-link" style={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitch}>Create account →</button>
        </p>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          🔒 Your data is encrypted and stored securely.
        </p>
      </div>
    </div>
  );
}
