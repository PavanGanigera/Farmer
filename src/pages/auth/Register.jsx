import React, { useState } from 'react';
import { User, Phone, Lock, Eye, EyeOff, MapPin, Sprout, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const crops = ['Wheat', 'Rice (Paddy)', 'Cotton', 'Maize', 'Chilli', 'Groundnut', 'Soybean', 'Red Gram', 'Other'];
const states = ['Telangana', 'Andhra Pradesh', 'Maharashtra', 'Karnataka', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Other'];

export default function Register({ onSwitch }) {
  const { register, verifyOtp } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', password: '', confirmPassword: '',
    state: '', district: '', landAcres: '', primaryCrop: '',
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [errors, setErrors]           = useState({});
  const [agreed, setAgreed]           = useState(false);
  const [registrationDone, setRegistrationDone] = useState(false);
  
  // OTP Simulation State
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
    if (form.password.length < 6) e.password = 'Minimum 6 characters required.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.state) e.state = 'Select your state.';
    if (!form.district.trim()) e.district = 'Enter your district.';
    if (!form.primaryCrop) e.primaryCrop = 'Select your primary crop.';
    if (!agreed) e.agreed = 'You must agree to the terms.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register({ ...form, name: `${form.firstName} ${form.lastName}` });
      // Transition to OTP step instead of success immediately
      setSimulatedOtp(res.otp); // Capture OTP to display in UI for demo
      setOtpStep(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifySimulatedOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpInput) { setError('Enter OTP.'); return; }
    setLoading(true);
    try {
      await verifyOtp(form.phone, otpInput);
      setOtpStep(false);
      setRegistrationDone(true);
      setTimeout(() => onSwitch(), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Strength indicator
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score <= 3) return { label: 'Medium', color: '#f59e0b', width: '60%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  })();

  return (
    <div className="auth-root">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-logo">🌾</div>
        <h1 className="auth-left-title">Join <span>AgriSmart</span></h1>
        <p className="auth-left-desc">
          Over 1,20,000 farmers across India are using AgriSmart to secure their financial future. Join them today.
        </p>
        <div className="auth-features">
          <div className="auth-feature-item"><span className="feature-icon">🆓</span>Free to get started</div>
          <div className="auth-feature-item"><span className="feature-icon">📱</span>Works on any smartphone</div>
          <div className="auth-feature-item"><span className="feature-icon">🌐</span>Available in Telugu & English</div>
          <div className="auth-feature-item"><span className="feature-icon">🔒</span>100% secure & private</div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right" style={{ width: '520px', padding: '2rem 2.5rem' }}>

        {/* ── SUCCESS SCREEN after registration ── */}
        {registrationDone ? (
          <div className="auth-success">
            <div className="auth-success-icon">🎉</div>
            <h2>Account Created!</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Welcome, <strong>{form.firstName}!</strong> Your AgriSmart account is ready.
              Taking you to the login page now…
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(16,185,129,0.3)', borderTopColor: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Redirecting to Login…
            </div>
            <button className="auth-btn auth-btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => onSwitch()}>
              → Go to Login now
            </button>
          </div>
        ) : otpStep ? (
          <div className="auth-form-header">
            <h2>Verify Phone Number</h2>
            <p style={{ marginTop: '0.5rem', color: '#64748b' }}>We have sent a 6-digit OTP to +91 {form.phone}.</p>
            
            <div style={{ background: '#ecfdf5', padding: '1rem', border: '1px solid #10b981', borderRadius: '8px', marginTop: '1rem', color: '#059669', fontSize: '0.875rem' }}>
              <strong>Demo OTP:</strong> {simulatedOtp}
            </div>

            <form onSubmit={verifySimulatedOtp} style={{ marginTop: '1.5rem' }}>
              <div className="auth-form-group">
                <input 
                  type="text" 
                  className="auth-input" 
                  style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
                  maxLength={6} 
                  value={otpInput} 
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} 
                  placeholder="------" 
                  required 
                />
              </div>
              <button type="submit" className="auth-btn auth-btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <span className="spinner" /> : 'Verify Account'}
              </button>
            </form>
            <button onClick={() => setOtpStep(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', marginTop: '1rem', cursor: 'pointer', width: '100%' }}>
              ← Back to Registration
            </button>
          </div>
        ) : (
          <>
        <div className="auth-form-header">
          <h1>Create Account</h1>
          <p>Fill in your details to get started — it takes less than 2 minutes.</p>
        </div>

        {error && (
          <div className="auth-global-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Row */}
          <div className="auth-form-row">
            <div className="auth-form-group">
              <label>First Name</label>
              <div className="auth-input-wrap">
                <User size={16} className="input-icon" />
                <input className={`auth-input ${errors.firstName ? 'has-error' : ''}`} placeholder="e.g. Raju" value={form.firstName} onChange={set('firstName')} />
              </div>
              {errors.firstName && <p className="auth-error-msg"><AlertCircle size={12} />{errors.firstName}</p>}
            </div>
            <div className="auth-form-group">
              <label>Last Name</label>
              <div className="auth-input-wrap">
                <User size={16} className="input-icon" />
                <input className={`auth-input ${errors.lastName ? 'has-error' : ''}`} placeholder="e.g. Reddy" value={form.lastName} onChange={set('lastName')} />
              </div>
              {errors.lastName && <p className="auth-error-msg"><AlertCircle size={12} />{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="auth-form-group">
            <label>Mobile Number</label>
            <div className="auth-input-wrap">
              <Phone size={16} className="input-icon" />
              <input className={`auth-input ${errors.phone ? 'has-error' : ''}`} placeholder="10-digit mobile number" type="tel" maxLength={10} value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value.replace(/\D/g, '') }); setErrors({ ...errors, phone: '' }); }} />
            </div>
            {errors.phone && <p className="auth-error-msg"><AlertCircle size={12} />{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPass ? 'text' : 'password'} className={`auth-input padded-right ${errors.password ? 'has-error' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {strength && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'width 0.4s, background 0.4s' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.2rem', fontWeight: 600 }}>{strength.label} password</p>
              </div>
            )}
            {errors.password && <p className="auth-error-msg"><AlertCircle size={12} />{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="auth-form-group">
            <label>Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showConfirm ? 'text' : 'password'} className={`auth-input padded-right ${errors.confirmPassword ? 'has-error' : ''}`} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {errors.confirmPassword && <p className="auth-error-msg"><AlertCircle size={12} />{errors.confirmPassword}</p>}
          </div>

          {/* State & District */}
          <div className="auth-form-row">
            <div className="auth-form-group">
              <label>State</label>
              <div className="auth-input-wrap">
                <MapPin size={16} className="input-icon" />
                <select className={`auth-input ${errors.state ? 'has-error' : ''}`} value={form.state} onChange={set('state')} style={{ paddingLeft: '2.75rem', appearance: 'none' }}>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {errors.state && <p className="auth-error-msg"><AlertCircle size={12} />{errors.state}</p>}
            </div>
            <div className="auth-form-group">
              <label>District</label>
              <div className="auth-input-wrap">
                <MapPin size={16} className="input-icon" />
                <input className={`auth-input ${errors.district ? 'has-error' : ''}`} placeholder="e.g. Warangal" value={form.district} onChange={set('district')} />
              </div>
              {errors.district && <p className="auth-error-msg"><AlertCircle size={12} />{errors.district}</p>}
            </div>
          </div>

          {/* Crop & Land */}
          <div className="auth-form-row">
            <div className="auth-form-group">
              <label>Primary Crop</label>
              <div className="auth-input-wrap">
                <Sprout size={16} className="input-icon" />
                <select className={`auth-input ${errors.primaryCrop ? 'has-error' : ''}`} value={form.primaryCrop} onChange={set('primaryCrop')} style={{ paddingLeft: '2.75rem', appearance: 'none' }}>
                  <option value="">Select Crop</option>
                  {crops.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {errors.primaryCrop && <p className="auth-error-msg"><AlertCircle size={12} />{errors.primaryCrop}</p>}
            </div>
            <div className="auth-form-group">
              <label>Land (Acres)</label>
              <div className="auth-input-wrap">
                <Sprout size={16} className="input-icon" />
                <input type="number" className="auth-input" placeholder="e.g. 5" value={form.landAcres} onChange={set('landAcres')} min="0" />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors({ ...errors, agreed: '' }); }} style={{ marginTop: '2px', accentColor: '#10b981', width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>
                I agree to the <button type="button" style={{ color: '#10b981', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }} onClick={() => alert('Terms & Privacy Policy')}>Terms of Service & Privacy Policy</button>.
              </span>
            </label>
            {errors.agreed && <p className="auth-error-msg" style={{ marginLeft: '1.6rem' }}><AlertCircle size={12} />{errors.agreed}</p>}
          </div>

          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '→ Create Account'}
          </button>
        </form>

        <p className="auth-footer-link">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch}>Sign in →</button>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
