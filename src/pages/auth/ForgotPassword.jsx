import React, { useState, useRef } from 'react';
import { Phone, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

// Simulate a fixed OTP for demo purposes
const DEMO_OTP = '123456';

export default function ForgotPassword({ onBack }) {
  const { phoneExists, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=new-password, 4=success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  // ---- Step 1: Send OTP ----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (!phoneExists(phone)) { setError('No account found with this mobile number.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep(2);
    startResendTimer();
  };

  const startResendTimer = () => {
    let t = 30;
    setResendTimer(t);
    const interval = setInterval(() => {
      t--;
      setResendTimer(t);
      if (t <= 0) clearInterval(interval);
    }, 1000);
  };

  // ---- OTP input handling ----
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ---- Step 2: Verify OTP ----
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    if (entered !== DEMO_OTP) { setError('Incorrect OTP. (Hint: use 123456 for demo)'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep(3);
  };

  // ---- Step 3: Reset Password ----
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    await resetPassword(phone, newPass);
    setLoading(false);
    setStep(4);
  };

  return (
    <div className="auth-root">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-logo">🔐</div>
        <h1 className="auth-left-title">Account <span>Recovery</span></h1>
        <p className="auth-left-desc">
          Forgot your password? No worries — we'll help you recover your account securely in just a few steps.
        </p>
        <div className="auth-features" style={{ marginTop: '2rem' }}>
          <div className="auth-feature-item"><span className="feature-icon">📱</span>An OTP is sent to your mobile</div>
          <div className="auth-feature-item"><span className="feature-icon">⏱️</span>OTP expires in 5 minutes</div>
          <div className="auth-feature-item"><span className="feature-icon">🔑</span>Set a strong new password</div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="auth-form-header">
          <h1>Reset Password</h1>
          <p>Follow the 3-step process to securely reset your password.</p>
        </div>

        {/* Step Indicators */}
        <div className="auth-steps">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`auth-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
              {s < 3 && <div className={`auth-step-line ${step > s ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="auth-global-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ---- STEP 1: Enter Phone ---- */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="auth-form-group">
              <label>Registered Mobile Number</label>
              <div className="auth-input-wrap">
                <Phone size={17} className="input-icon" />
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="Enter your 10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              We'll send a 6-digit OTP to this number to verify your identity.
            </p>
            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '→ Send OTP'}
            </button>
          </form>
        )}

        {/* ---- STEP 2: Enter OTP ---- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem' }}>
              A 6-digit OTP has been sent to <strong>+91 {phone}</strong>.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              (For demo, use OTP: <strong>123456</strong>)
            </p>

            <div className="otp-wrap" onPaste={handleOtpPaste}>
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="tel"
                  maxLength={1}
                  className="otp-input"
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#64748b' }}>
              {resendTimer > 0 ? (
                <span>Resend OTP in <strong>{resendTimer}s</strong></span>
              ) : (
                <button type="button" style={{ color: '#10b981', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }} onClick={() => { startResendTimer(); setOtp(['', '', '', '', '', '']); setError(''); otpRefs.current[0]?.focus(); }}>
                  Resend OTP
                </button>
              )}
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '→ Verify OTP'}
            </button>
          </form>
        )}

        {/* ---- STEP 3: New Password ---- */}
        {step === 3 && (
          <form onSubmit={handleReset} noValidate>
            <div className="auth-form-group">
              <label>New Password</label>
              <div className="auth-input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input padded-right"
                  placeholder="Min. 6 characters"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="auth-form-group">
              <label>Confirm New Password</label>
              <div className="auth-input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-input padded-right"
                  placeholder="Re-enter new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '→ Reset Password'}
            </button>
          </form>
        )}

        {/* ---- STEP 4: Success ---- */}
        {step === 4 && (
          <div className="auth-success">
            <div className="auth-success-icon">🎉</div>
            <h2>Password Reset Successfully!</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <button className="auth-btn auth-btn-primary" onClick={onBack}>
              → Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
