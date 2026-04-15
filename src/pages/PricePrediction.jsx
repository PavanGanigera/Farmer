import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit, Info, Download, Share2 } from 'lucide-react';
import Modal from '../components/Modal';

const allData = {
  Wheat: [
    { month: 'Jan', historical: 2100 }, { month: 'Feb', historical: 2150 }, { month: 'Mar', historical: 2200 },
    { month: 'Apr', historical: 2250, predicted: 2250 },
    { month: 'May', predicted: 2310 }, { month: 'Jun', predicted: 2400 }, { month: 'Jul', predicted: 2380 },
  ],
  Cotton: [
    { month: 'Jan', historical: 7000 }, { month: 'Feb', historical: 7100 }, { month: 'Mar', historical: 7250 },
    { month: 'Apr', historical: 7400, predicted: 7400 },
    { month: 'May', predicted: 7600 }, { month: 'Jun', predicted: 7850 }, { month: 'Jul', predicted: 8100 },
  ],
  Rice: [
    { month: 'Jan', historical: 2000 }, { month: 'Feb', historical: 1980 }, { month: 'Mar', historical: 2050 },
    { month: 'Apr', historical: 2100, predicted: 2100 },
    { month: 'May', predicted: 2070 }, { month: 'Jun', predicted: 2020 }, { month: 'Jul', predicted: 2150 },
  ],
  Maize: [
    { month: 'Jan', historical: 1700 }, { month: 'Feb', historical: 1750 }, { month: 'Mar', historical: 1800 },
    { month: 'Apr', historical: 1850, predicted: 1850 },
    { month: 'May', predicted: 1900 }, { month: 'Jun', predicted: 1950 }, { month: 'Jul', predicted: 1880 },
  ],
};

const crops = ['Wheat', 'Cotton', 'Rice', 'Maize'];

const insights = {
  Wheat: { summary: 'Wheat prices expected to rise by 6.7% through June due to reduced rainfall and high export demand.', advice: 'Consider holding stock until June for maximum returns. Sell in Hyderabad or Warangal markets.', confidence: 87 },
  Cotton: { summary: 'Cotton showing a strong uptrend (+15% predicted by July) driven by textile industry demand.', advice: 'Excellent time to grow cotton. Explore direct buyer connections in Marketplace module.', confidence: 91 },
  Rice: { summary: 'Rice prices may temporarily dip in May but recover by July. Moderate growth projected.', advice: 'Sell current stock at current prices or wait until July for recovery.', confidence: 78 },
  Maize: { summary: 'Maize shows steady growth driven by poultry and ethanol industries.', advice: 'Stable investment. Good for contract farming arrangements with local processors.', confidence: 83 },
};

export default function PricePrediction() {
  const [crop, setCrop] = useState('Wheat');
  const [showInsightModal, setShowInsightModal] = useState(false);

  const currentInsight = insights[crop];
  const chartData = allData[crop];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Price Prediction <BrainCircuit style={{ color: 'var(--color-secondary)' }} />
          </h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>ML-driven 3 month price forecast for major crops.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="input-field" style={{ width: '160px' }} value={crop} onChange={(e) => setCrop(e.target.value)}>
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => alert('Chart exported as PDF!')}><Download size={16} /> Export</button>
          <button className="btn btn-outline" onClick={() => alert('Link copied!')}><Share2 size={16} /> Share</button>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Info size={20} style={{ color: 'var(--color-info)', flexShrink: 0 }} />
        <span className="text-sm" style={{ flex: 1 }}>Prediction confidence: <strong>{currentInsight.confidence}%</strong> — Based on 5 years of weather, yield, and market data.</span>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }} onClick={() => setShowInsightModal(true)}>
          View AI Insights →
        </button>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>📈 {crop} — Price Trend & Forecast</h3>
        <div style={{ height: '380px', width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-5} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="historical" name="Historical (₹)" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" name="AI Predicted (₹)" stroke="var(--color-secondary)" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 5 }} activeDot={{ r: 7 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crop selector cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {crops.map((c) => (
          <button key={c} onClick={() => setCrop(c)} className="card" style={{ textAlign: 'center', padding: '1rem', border: c === crop ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer' }}>
            <p className="font-bold" style={{ color: c === crop ? 'var(--color-primary)' : 'inherit' }}>{c}</p>
            <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Conf: {insights[c].confidence}%</p>
          </button>
        ))}
      </div>

      {/* AI Insights Modal */}
      <Modal isOpen={showInsightModal} onClose={() => setShowInsightModal(false)} title={`🤖 AI Insights — ${crop}`} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.07)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
            <p className="font-semibold text-sm" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>📊 Market Analysis</p>
            <p>{currentInsight.summary}</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.07)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-secondary)' }}>
            <p className="font-semibold text-sm" style={{ marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>💡 Actionable Advice</p>
            <p>{currentInsight.advice}</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
            <p className="text-sm text-muted">Prediction Confidence</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, height: '10px', background: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${currentInsight.confidence}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '5px', transition: 'width 1s ease' }}></div>
              </div>
              <span className="font-bold text-primary">{currentInsight.confidence}%</span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowInsightModal(false)}>Close</button>
            <button className="btn btn-primary" onClick={() => { setShowInsightModal(false); alert('Reminder set for 7 days!'); }}>🔔 Set Price Alert</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
