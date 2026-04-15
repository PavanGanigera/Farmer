import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudSun, TrendingUp, Wallet, ArrowRight, Plus, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const notifications = [
  { id: 1, type: 'alert', text: 'Cotton prices surged 5% in Warangal market today!', time: '2 hrs ago' },
  { id: 2, type: 'weather', text: 'Heavy rain expected in your area tomorrow.', time: '5 hrs ago' },
  { id: 3, type: 'loan', text: 'Your Kisan Credit Card application is approved!', time: '1 day ago' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [harvestModal, setHarvestModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ crop: user?.primaryCrop || '', quantity: '', unit: 'Qtl', date: '', notes: '' });
  const navigate = useNavigate();

  // Derive display values from registered profile
  const farmerName = user ? `${user.firstName} ${user.lastName}` : 'Farmer';
  const farmerLocation = user ? `${user.district}, ${user.state}` : 'Your Location';
  const farmerDistrict = user?.district || 'Warangal'; // Default to a realistic area
  const primaryCrop = user?.primaryCrop || 'your crops';
  const landAcres   = user?.landAcres   ? `${user.landAcres} acres` : '';

  const [marketTrends, setMarketTrends] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Fetch Market Trends
    axios.get('http://localhost:5000/api/data/mandi')
      .then(res => setMarketTrends(res.data.markets.slice(0, 3))) // take top 3
      .catch(console.error);

    // Fetch Weather Data
    axios.get(`http://localhost:5000/api/data/weather?district=${farmerDistrict}`)
      .then(res => setWeatherData(res.data))
      .catch(console.error);
  }, [farmerDistrict]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setHarvestModal(false); setForm({ crop: '', quantity: '', unit: 'Qtl', date: '', notes: '' }); }, 2000);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">
        <div>
          <h1>{t('welcome')}, {user?.firstName}! 👋</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            📍 {farmerLocation}{landAcres ? ` · ${landAcres}` : ''}{primaryCrop !== 'your crops' ? ` · ${primaryCrop} Farmer` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setNotifModal(true)} style={{ position: 'relative' }}>
            <Bell size={18} /> {t('alerts')}
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
          </button>
          <button className="btn btn-primary" onClick={() => setHarvestModal(true)}>
            <Plus size={18} /> {t('add_harvest')}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: 'white', padding: '2rem', marginBottom: '2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          border: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
        }}>
        <div>
          <h2 style={{ color: 'white' }}>Expected rain tomorrow! 🌧️</h2>
          <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Prepare your fields. Delay pesticide spraying by 2 days.</p>
        </div>
        <button className="btn" onClick={() => navigate('/weather')} style={{ backgroundColor: 'white', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
          View Forecast <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Trends Widget */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <h3 className="flex items-center gap-2"><TrendingUp className="text-primary" /> Market Trends</h3>
            <button className="btn btn-outline text-sm" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate('/prices')}>View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {marketTrends.length > 0 ? marketTrends.map((c, i) => (
              <div key={i} className="flex justify-between items-center pb-3" style={{ borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                <span className="font-semibold">{c.crop}</span>
                <span className="font-bold flex items-center gap-2">₹{c.price.toLocaleString()} <span className={`badge ${c.trend === '+' ? 'badge-success' : 'badge-danger'}`}>{c.trend}{c.trendVal}</span></span>
              </div>
            )) : <p className="text-muted text-sm">Loading market prices...</p>}
          </div>
          <button className="btn btn-primary w-full" style={{ marginTop: '1rem' }} onClick={() => navigate('/prediction')}>See AI Price Forecast →</button>
        </div>

        {/* Finance Widget */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <h3 className="flex items-center gap-2"><Wallet style={{ color: 'var(--color-secondary)' }} /> Finances</h3>
            <button className="btn btn-outline text-sm" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate('/finance')}>Details</button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted">Total Income (This Month)</p>
              <h2 className="text-2xl" style={{ marginTop: '0.25rem' }}>₹45,000</h2>
            </div>
            <div>
              <p className="text-sm text-muted">Total Expenses</p>
              <h2 className="text-xl" style={{ color: 'var(--color-danger)', marginTop: '0.25rem' }}>₹12,400</h2>
            </div>
            <div style={{ background: 'var(--color-border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '30%', background: 'var(--color-secondary)', height: '100%', borderRadius: '4px' }}></div>
            </div>
          </div>
          <button className="btn btn-outline w-full" style={{ marginTop: '1rem' }} onClick={() => navigate('/finance')}>Manage Finances →</button>
        </div>

        {/* Weather widget */}
        <div className="card" style={{
            background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)',
            color: 'white', border: 'none',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
          }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'white' }}>Current Weather</h3>
            <div style={{ fontSize: '2rem' }}>{weatherData?.current?.icon || <CloudSun />}</div>
          </div>
          <h1 style={{ fontSize: '3.5rem', color: 'white', margin: '0.5rem 0', fontWeight: 'bold' }}>{weatherData?.current?.temp || '--'}°C</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>📍 {farmerLocation}</p>
          <div className="flex gap-4" style={{ marginTop: '0.75rem', opacity: 0.8, fontSize: '0.85rem' }}>
            <span>Humidity: {weatherData?.current?.humidity || '--'}%</span>
            <span>Wind: {weatherData?.current?.wind || '--'} km/h</span>
          </div>
          <button onClick={() => navigate('/weather')} className="btn w-full" style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
            Full Weather Report →
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: '2rem' }}>
        {[
          { label: 'Apply for Loan', icon: '🏦', path: '/finance-services', color: '#10b981' },
          { label: 'Get Insurance', icon: '🛡️', path: '/finance-services', color: '#f59e0b' },
          { label: 'Sell Produce', icon: '🛒', path: '/marketplace', color: '#3b82f6' },
          { label: 'AI Prediction', icon: '🤖', path: '/prediction', color: '#8b5cf6' },
        ].map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem', cursor: 'pointer', transition: 'all 0.3s', border: `2px solid transparent`, ':hover': { borderColor: item.color } }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <p className="font-semibold text-sm">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Add Harvest Modal */}
      <Modal isOpen={harvestModal} onClose={() => setHarvestModal(false)} title="🌾 Add New Harvest Entry" size="md">
        {submitted ? (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>Harvest Added!</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Your harvest entry has been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Crop Name</label>
                <select className="input-field" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} required>
                  <option value="">Select Crop</option>
                  <option>Wheat</option><option>Rice (Paddy)</option><option>Cotton</option><option>Maize</option><option>Chilli</option>
                </select>
              </div>
              <div className="form-group">
                <label>Harvest Date</label>
                <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" className="input-field" placeholder="e.g. 50" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select className="input-field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option>Qtl</option><option>Kg</option><option>Ton</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea className="input-field" rows="3" placeholder="Any notes about this harvest..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setHarvestModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Harvest</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={notifModal} onClose={() => setNotifModal(false)} title="🔔 Notifications" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
              <p className="font-semibold text-sm">{n.text}</p>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{n.time}</p>
            </div>
          ))}
          <button className="btn btn-outline w-full" onClick={() => setNotifModal(false)}>Mark All as Read</button>
        </div>
      </Modal>
    </div>
  );
}
