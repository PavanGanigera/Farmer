import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, LineChart, Wallet, CloudRain, ShieldCheck, ShoppingCart, BrainCircuit, X, Leaf } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import './Sidebar.css';

const navItems = [
  { labelKey: 'nav_dashboard', path: '/', icon: LayoutDashboard },
  { labelKey: 'nav_prices', path: '/prices', icon: TrendingUp },
  { labelKey: 'nav_prediction', path: '/prediction', icon: LineChart },
  { labelKey: 'nav_finance', path: '/finance', icon: Wallet },
  { labelKey: 'nav_weather', path: '/weather', icon: CloudRain },
  { labelKey: 'nav_loans', path: '/finance-services', icon: ShieldCheck },
  { labelKey: 'nav_marketplace', path: '/marketplace', icon: ShoppingCart },
  { labelKey: 'nav_scanner', path: '/scanner', icon: Leaf },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useLang();
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="logo-icon">🚜</span>
            <h2>Agri<span className="text-primary">Smart</span></h2>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsOpen(false)} aria-label="Close sidebar">
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* AI Highlight */}
          <div style={{
            margin: '1.5rem 0.5rem 0',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
            onClick={() => { document.querySelector('.ai-fab')?.click(); setIsOpen(false); }}
          >
            <div style={{ fontSize: '1.5rem' }}>🤖</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#4c1d95' }}>KisanAI</p>
              <p style={{ fontSize: '0.75rem', color: '#6d28d9' }}>{t('nav_ai')}</p>
            </div>
            <BrainCircuit size={18} style={{ color: '#7c3aed', marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 className="text-sm font-bold" style={{ marginBottom: '0.25rem' }}>Need Help?</h4>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Contact our support team 24/7</p>
            <button className="btn btn-primary w-full text-sm" onClick={() => alert('Support: 1800-XXX-XXXX (Toll Free)')}>Contact Support</button>
          </div>
        </div>
      </aside>
    </>
  );
}
