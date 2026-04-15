import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudRain, Wind, Droplets, Sun, AlertTriangle, MapPin, RefreshCw, Thermometer } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const farmingTips = [
  { tip: 'Heavy rain expected — delay pesticide spray by 2 days.', icon: '🚫', urgency: 'high' },
  { tip: 'Good moisture levels this week. No irrigation needed for wheat.', icon: '💧', urgency: 'low' },
  { tip: 'Wednesday is ideal for open-field sowing.', icon: '🌱', urgency: 'low' },
];

export default function Weather() {
  const { user } = useAuth();

  // Default to farmer's registered district + state
  const registeredLocation = user
    ? `${user.district || 'Your District'}, ${user.state || 'Your State'}`
    : 'Your Location';

  const [location, setLocation]           = useState(registeredLocation);
  const [locationInput, setLocationInput] = useState(registeredLocation);
  const [locationModal, setLocationModal] = useState(false);
  const [alertModal, setAlertModal]       = useState(false);

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Live Weather API
  const fetchWeather = async (dist) => {
    setLoading(true);
    try {
      // Split location string to just grab the district name (first part)
      const districtName = dist.split(',')[0].trim();
      const res = await axios.get(`http://localhost:5000/api/data/weather?district=${districtName}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error('Error fetching weather', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  // Quick-pick locations: always include HOME location first
  const quickLocations = [
    registeredLocation,
    'Hyderabad, Telangana',
    'Warangal, Telangana',
    'Guntur, Andhra Pradesh',
    'Nizamabad, Telangana',
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  const handleLocationChange = (e) => {
    e.preventDefault();
    setLocation(locationInput);
    setLocationModal(false);
  };

  if (loading || !weatherData) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Weather & Alerts</h1>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
            <MapPin size={14} /> {location}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setLocationModal(true)}><MapPin size={16} /> Change Location</button>
          <button className="btn btn-outline" onClick={() => fetchWeather(location)}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderLeft: '4px solid var(--color-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle style={{ color: 'var(--color-secondary)', flexShrink: 0 }} size={24} />
          <div>
            <h3 style={{ color: '#92400e' }}>🌧️ Unseasonal Rain Alert</h3>
            <p style={{ color: '#78350f', marginTop: '0.25rem', fontSize: '0.9rem' }}>Moderate to heavy rainfall expected in the next 48 hrs. Delay sowing and cover harvested crops.</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setAlertModal(true)}>View Farming Tips</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
        {/* Current Conditions */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)', color: 'white', border: 'none', boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ color: 'white', opacity: 0.9 }}>Today</h3>
              <p style={{ opacity: 0.75, fontSize: '0.85rem' }}>{location}</p>
            </div>
            <div style={{ fontSize: '3.5rem', opacity: 0.85 }}>{weatherData.current.icon}</div>
          </div>
          <p style={{ fontSize: '5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{weatherData.current.temp}°</p>
          <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', opacity: 0.9 }}>{weatherData.current.desc}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { icon: <Droplets size={18} />, label: 'Humidity', val: `${weatherData.current.humidity}%` },
              { icon: <Wind size={18} />, label: 'Wind', val: `${weatherData.current.wind} km/h` },
              { icon: <Thermometer size={18} />, label: 'Dew Point', val: '19°C' },
              { icon: <Sun size={18} />, label: 'UV Index', val: 'Low (2)' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.85 }}>
                {s.icon}
                <div>
                  <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>{s.label}</p>
                  <p style={{ fontWeight: 600 }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>5-Day Forecast</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {weatherData.forecast.map((d, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, width: '40px' }}>{d.day}</span>
                <span style={{ fontSize: '1.5rem' }}>{d.icon}</span>
                <span className="text-muted text-sm" style={{ flex: 1, paddingLeft: '0.5rem' }}>{d.desc}</span>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>💧{d.rain}</span>
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{d.high}° / <span className="text-muted">{d.low}°</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Location Modal */}
      <Modal isOpen={locationModal} onClose={() => setLocationModal(false)} title="📍 Change Location" size="sm">
        <form onSubmit={handleLocationChange}>
          <div className="form-group">
            <label>Enter City or District</label>
            <input type="text" className="input-field" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="e.g. Warangal, Telangana" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {quickLocations.map((loc) => (
              <button key={loc} type="button" className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.875rem' }} onClick={() => setLocationInput(loc)}>
                {loc === registeredLocation ? `🏠 ${loc} (Your Farm)` : loc}
              </button>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setLocationModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Location</button>
          </div>
        </form>
      </Modal>

      {/* Farm Tips Modal */}
      <Modal isOpen={alertModal} onClose={() => setAlertModal(false)} title="🌱 Farming Tips for This Week" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {farmingTips.map((t, i) => (
            <div key={i} style={{ padding: '1rem', background: t.urgency === 'high' ? 'rgba(239, 68, 68, 0.07)' : 'rgba(16, 185, 129, 0.07)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${t.urgency === 'high' ? 'var(--color-danger)' : 'var(--color-success)'}`, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
              <p style={{ fontWeight: 500 }}>{t.tip}</p>
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-primary w-full" onClick={() => setAlertModal(false)}>Got it!</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
