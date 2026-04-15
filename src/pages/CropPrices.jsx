import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, TrendingUp, TrendingDown, RefreshCw, Star } from 'lucide-react';
import Modal from '../components/Modal';

export default function CropPrices() {
  const [allCrops, setAllCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrend, setFilterTrend] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Fetching live data...');

  const fetchPrices = () => {
    axios.get('http://localhost:5000/api/data/mandi')
      .then(res => {
        // Map backend payload to component's expected structure
        const mapped = res.data.markets.map((m, i) => ({
          id: i + 1,
          name: m.crop,
          market: 'Local Mandi',
          price: m.price,
          trend: m.trend === '+' ? 'up' : 'down',
          change: `${m.trend}${m.trendVal}`,
          high: Math.round(m.price * 1.02), // mock high/low
          low: Math.round(m.price * 0.98),
          volume: Math.floor(Math.random() * 1000 + 100) + ' Qtl'
        }));
        setAllCrops(mapped);
        
        const date = new Date(res.data.date);
        setLastUpdated(date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'}));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filtered = allCrops.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTrend = filterTrend === 'all' || c.trend === filterTrend;
    return matchSearch && matchTrend;
  });

  const toggleWatchlist = (id) => {
    setWatchlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">
        <div>
          <h1>Daily Crop Prices</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Live Mandi prices · Last updated: {lastUpdated}</p>
        </div>
        <button className="btn btn-outline" onClick={fetchPrices}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Crops', value: allCrops.length },
          { label: 'Rising Today', value: allCrops.filter(c => c.trend === 'up').length, color: 'var(--color-success)' },
          { label: 'Falling Today', value: allCrops.filter(c => c.trend === 'down').length, color: 'var(--color-danger)' },
          { label: 'Watchlist', value: watchlist.length, color: 'var(--color-secondary)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <h2 style={{ color: s.color || 'var(--color-text-main)', fontSize: '2rem', fontWeight: 'bold' }}>{s.value}</h2>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Search crop or market..." className="input-field" style={{ paddingLeft: '2.75rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'up', 'down'].map((f) => (
              <button key={f} className={`btn ${filterTrend === f ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }} onClick={() => setFilterTrend(f)}>
                {f === 'all' ? 'All' : f === 'up' ? '↑ Rising' : '↓ Falling'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)' }}>
                {['Crop', 'Market', 'Price/Qtl', 'High', 'Low', 'Volume', 'Trend', 'Action'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-base)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{row.name}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)' }}>{row.market}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>₹{row.price.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-success)', fontWeight: 500 }}>₹{row.high.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-danger)', fontWeight: 500 }}>₹{row.low.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)' }}>{row.volume}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${row.trend === 'up' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {row.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {row.change}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setSelectedCrop(row)}>Details</button>
                      <button title="Add to Watchlist" onClick={() => toggleWatchlist(row.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: watchlist.includes(row.id) ? 'var(--color-secondary)' : 'var(--color-border)', transition: 'color 0.2s' }}>
                        <Star size={18} fill={watchlist.includes(row.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No crops found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop Detail Modal */}
      <Modal isOpen={!!selectedCrop} onClose={() => setSelectedCrop(null)} title={selectedCrop ? `📊 ${selectedCrop.name} — Price Details` : ''} size="md">
        {selectedCrop && (
          <div>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Current Price', value: `₹${selectedCrop.price.toLocaleString()}`, color: 'var(--color-primary)' },
                { label: "Today's Change", value: selectedCrop.change, color: selectedCrop.trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)' },
                { label: "Day's High", value: `₹${selectedCrop.high.toLocaleString()}`, color: 'var(--color-success)' },
                { label: "Day's Low", value: `₹${selectedCrop.low.toLocaleString()}`, color: 'var(--color-danger)' },
              ].map((s) => (
                <div key={s.label} style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
                  <p className="text-sm text-muted">{s.label}</p>
                  <h3 style={{ color: s.color, marginTop: '0.25rem', fontSize: '1.4rem', fontWeight: 'bold' }}>{s.value}</h3>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <p className="text-sm text-muted">Market</p>
              <p className="font-semibold" style={{ marginTop: '0.25rem' }}>{selectedCrop.market}, Volume: {selectedCrop.volume}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedCrop(null)}>Close</button>
              <button className="btn btn-secondary" onClick={() => { toggleWatchlist(selectedCrop.id); }}>
                <Star size={16} /> {watchlist.includes(selectedCrop.id) ? 'Remove Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
