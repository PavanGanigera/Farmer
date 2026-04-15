import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '👤'
    : '👤';

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search crops, prices, or alerts..." className="search-input" />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn notification-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="user-profile"
            onClick={() => setDropOpen(!dropOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.firstName} {user?.lastName}</span>
              <span className="profile-role">{user?.primaryCrop || 'Farmer'} · {user?.district || ''}</span>
            </div>
            <ChevronDown size={16} style={{ color: '#64748b', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {dropOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'white', borderRadius: '12px', minWidth: '200px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>+91 {user?.phone}</p>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  {[
                    { label: `👤 ${t('my_profile')}`, action: () => navigate('/profile') },
                    { label: `🌐 ${t('language_settings')}`, action: () => navigate('/profile') },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { item.action(); setDropOpen(false); }} style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '0.65rem 0.875rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#475569',
                      borderRadius: '8px', transition: 'background 0.15s',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                    <button onClick={() => { logout(); setDropOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left',
                      padding: '0.65rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: '#ef4444', fontWeight: 600,
                      borderRadius: '8px', transition: 'background 0.15s',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={15} /> {t('sign_out')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
