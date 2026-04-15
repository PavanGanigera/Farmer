import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import {
  User, Phone, MapPin, Sprout, Lock, Eye, EyeOff,
  Bell, Globe, Info, ChevronRight, CheckCircle,
  Camera, Edit2, AlertCircle, LogOut, Shield, FileText, Headphones,
} from 'lucide-react';
import './Profile.css';

const CROPS  = ['Wheat','Rice (Paddy)','Cotton','Maize','Chilli','Groundnut','Soybean','Red Gram','Other'];
const STATES = ['Telangana','Andhra Pradesh','Maharashtra','Karnataka','Punjab','Haryana','Uttar Pradesh','Rajasthan','Madhya Pradesh','Other'];

/* --- helper section wrapper --- */
function Section({ icon, title, children }) {
  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="profile-section-body">{children}</div>
    </div>
  );
}

/* --- editable field --- */
function Field({ label, value, editing, onChange, type = 'text', children }) {
  return (
    <div className="profile-field">
      <label className="profile-field-label">{label}</label>
      {editing
        ? (children || (
            <input
              type={type}
              className="profile-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ))
        : <p className="profile-field-value">{value || '—'}</p>
      }
    </div>
  );
}

/* --- toggle switch --- */
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--color-primary)' : '#cbd5e1',
        position: 'relative', transition: 'background 0.3s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.3s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function Profile() {
  const { user, logout, resetPassword, register } = useAuth();
  const { lang, switchLang, t } = useLang();

  /* ---- states ---- */
  const [editPersonal, setEditPersonal] = useState(false);
  const [editFarm,     setEditFarm]     = useState(false);
  const [personal, setPersonal] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
  });
  const [farm, setFarm] = useState({
    state:       user?.state       || '',
    district:    user?.district    || '',
    landAcres:   user?.landAcres   || '',
    primaryCrop: user?.primaryCrop || '',
  });

  /* password change */
  const [pwForm, setPwForm]     = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  /* notifications */
  const [notifs, setNotifs] = useState({ price: true, weather: true, loan: false, market: true });

  /* toast */
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* save personal */
  const savePersonal = () => {
    // Update localStorage users list
    const USERS_KEY = 'agrismart_users';
    const SESSION_KEY = 'agrismart_session';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex(u => u.phone === user.phone);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...personal };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const session = { ...users[idx], password: undefined };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    setEditPersonal(false);
    showToast(t('profile_saved'));
  };

  /* save farm */
  const saveFarm = () => {
    const USERS_KEY = 'agrismart_users';
    const SESSION_KEY = 'agrismart_session';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex(u => u.phone === user.phone);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...farm };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const session = { ...users[idx], password: undefined };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    setEditFarm(false);
    showToast(t('profile_saved'));
  };

  /* change password */
  const changePassword = (e) => {
    e.preventDefault();
    setPwError('');
    const users = JSON.parse(localStorage.getItem('agrismart_users') || '[]');
    const found = users.find(u => u.phone === user.phone);
    if (!found || found.password !== pwForm.current) {
      setPwError('Current password is incorrect.'); return;
    }
    if (pwForm.new.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.new !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    resetPassword(user.phone, pwForm.new);
    setPwSuccess(true);
    setPwForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
    showToast(t('password_saved'));
  };

  const togglePw = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  const initials = `${personal.firstName?.[0] || ''}${personal.lastName?.[0] || ''}`.toUpperCase() || '👤';
  const joinDate  = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="page-container animate-fade-in">
      {/* Toast */}
      {toast && <div className="profile-toast"><CheckCircle size={16} />{toast}</div>}

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{initials}</div>
          <button className="profile-avatar-edit" title="Change photo" onClick={() => alert('Photo upload coming soon!')}>
            <Camera size={14} />
          </button>
        </div>
        <div className="profile-hero-info">
          <h1>{personal.firstName} {personal.lastName}</h1>
          <p className="text-muted">📱 +91 {personal.phone}</p>
          <p className="text-muted" style={{ marginTop: '0.2rem' }}>
            📍 {farm.district || '—'}, {farm.state || '—'}
            {farm.primaryCrop ? ` · 🌾 ${farm.primaryCrop} Farmer` : ''}
            {farm.landAcres   ? ` · ${farm.landAcres} Acres`        : ''}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            {t('member_since')}: {joinDate}
          </p>
        </div>
      </div>

      <div className="profile-grid">

        {/* ── 1. Personal Information ── */}
        <Section icon={<User size={18} />} title={t('personal_info')}>
          <div className="profile-form-row">
            <Field label={t('first_name')} value={personal.firstName} editing={editPersonal} onChange={v => setPersonal(p => ({...p, firstName: v}))} />
            <Field label={t('last_name')}  value={personal.lastName}  editing={editPersonal} onChange={v => setPersonal(p => ({...p, lastName: v}))} />
          </div>
          <div className="profile-form-row">
            <Field label={t('phone')} value={`+91 ${personal.phone}`} editing={false} />
          </div>
          <div className="profile-field-actions">
            {editPersonal ? (
              <>
                <button className="btn btn-outline" onClick={() => setEditPersonal(false)}>{t('cancel')}</button>
                <button className="btn btn-primary" onClick={savePersonal}>{t('save')}</button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => setEditPersonal(true)}>
                <Edit2 size={15} /> {t('edit')}
              </button>
            )}
          </div>
        </Section>

        {/* ── 2. Farm Details ── */}
        <Section icon={<Sprout size={18} />} title={t('farm_details')}>
          <div className="profile-form-row">
            <Field label={t('state')} value={farm.state} editing={editFarm} onChange={v => setFarm(f => ({...f, state: v}))}>
              {editFarm && (
                <select className="profile-input" value={farm.state} onChange={e => setFarm(f => ({...f, state: e.target.value}))}>
                  <option value="">— Select —</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
            </Field>
            <Field label={t('district')} value={farm.district} editing={editFarm} onChange={v => setFarm(f => ({...f, district: v}))} />
          </div>
          <div className="profile-form-row">
            <Field label={t('primary_crop')} value={farm.primaryCrop} editing={editFarm} onChange={v => setFarm(f => ({...f, primaryCrop: v}))}>
              {editFarm && (
                <select className="profile-input" value={farm.primaryCrop} onChange={e => setFarm(f => ({...f, primaryCrop: e.target.value}))}>
                  <option value="">— Select —</option>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              )}
            </Field>
            <Field label={t('land_acres')} value={farm.landAcres} editing={editFarm} onChange={v => setFarm(f => ({...f, landAcres: v}))} type="number" />
          </div>
          <div className="profile-field-actions">
            {editFarm ? (
              <>
                <button className="btn btn-outline" onClick={() => setEditFarm(false)}>{t('cancel')}</button>
                <button className="btn btn-primary" onClick={saveFarm}>{t('save')}</button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => setEditFarm(true)}>
                <Edit2 size={15} /> {t('edit')}
              </button>
            )}
          </div>
        </Section>

        {/* ── 3. Change Password ── */}
        <Section icon={<Lock size={18} />} title={t('change_password')}>
          {pwSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', color: '#059669', marginBottom: '1rem' }}>
              <CheckCircle size={16} /> {t('password_saved')}
            </div>
          )}
          {pwError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.07)', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} /> {pwError}
            </div>
          )}
          <form onSubmit={changePassword}>
            {[
              { key: 'current', label: t('current_password') },
              { key: 'new',     label: t('new_password') },
              { key: 'confirm', label: t('confirm_password') },
            ].map(f => (
              <div key={f.key} className="profile-field" style={{ marginBottom: '0.875rem' }}>
                <label className="profile-field-label">{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[f.key] ? 'text' : 'password'}
                    className="profile-input"
                    style={{ paddingRight: '2.5rem' }}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({...p, [f.key]: e.target.value}))}
                    required
                  />
                  <button type="button" onClick={() => togglePw(f.key)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPw[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Shield size={16} /> {t('change_password')}
            </button>
          </form>
        </Section>

        {/* ── 4. Language ── */}
        <Section icon={<Globe size={18} />} title={t('language_settings')}>
          <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>{t('choose_language')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { code: 'en', label: t('lang_en'), flag: '🇬🇧' },
              { code: 'te', label: t('lang_te'), flag: '🇮🇳' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className={`lang-btn ${lang === l.code ? 'lang-btn-active' : ''}`}
              >
                <span style={{ fontSize: '1.4rem' }}>{l.flag}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.label}</p>
                  {lang === l.code && <p style={{ fontSize: '0.73rem', color: 'var(--color-primary)' }}>✓ Active</p>}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 5. Notifications ── */}
        <Section icon={<Bell size={18} />} title={t('notification_prefs')}>
          {[
            { key: 'price',   label: t('notif_price'),   desc: 'Get alerts when crop prices change significantly' },
            { key: 'weather', label: t('notif_weather'),  desc: 'Rain, storm, and frost warnings for your area' },
            { key: 'loan',    label: t('notif_loan'),     desc: 'Updates on your loan and insurance applications' },
            { key: 'market',  label: t('notif_market'),   desc: 'New buyer offers matching your crops' },
          ].map(n => (
            <div key={n.key} className="notif-row">
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.label}</p>
                <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>{n.desc}</p>
              </div>
              <Toggle checked={notifs[n.key]} onChange={v => setNotifs(p => ({...p, [n.key]: v}))} />
            </div>
          ))}
        </Section>

        {/* ── 6. About ── */}
        <Section icon={<Info size={18} />} title={t('about_app')}>
          {[
            { icon: <Info size={16} />,        label: t('app_version'),    value: 'v1.0.0', action: null },
            { icon: <FileText size={16} />,     label: t('privacy_policy'), value: '',       action: () => alert('Privacy Policy coming soon!') },
            { icon: <FileText size={16} />,     label: t('terms'),          value: '',       action: () => alert('Terms of Service coming soon!') },
            { icon: <Headphones size={16} />,   label: t('support'),        value: '1800-XXX-XXXX', action: () => alert('Calling support!') },
          ].map((item, i) => (
            <button
              key={i}
              className="about-row"
              onClick={item.action || undefined}
              style={{ cursor: item.action ? 'pointer' : 'default' }}
            >
              <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</span>
              {item.value && <span className="text-muted text-sm">{item.value}</span>}
              {item.action && <ChevronRight size={16} style={{ color: '#94a3b8' }} />}
            </button>
          ))}

          {/* Sign Out */}
          <button
            className="about-row"
            onClick={logout}
            style={{ color: 'var(--color-danger)', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}
          >
            <LogOut size={16} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>{t('sign_out')}</span>
          </button>
        </Section>

      </div>
    </div>
  );
}
