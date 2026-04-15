import React, { useState } from 'react';
import { ShieldCheck, Banknote, CheckCircle, Calculator } from 'lucide-react';
import Modal from '../components/Modal';

const loans = [
  { id: 1, name: 'Kisan Credit Card (KCC)', interest: '4%', max: '₹3,00,000', badge: 'Govt Backed', badgeClass: 'badge-success', desc: 'Low-interest loan for seeds, fertilizers, and equipment. Subsidized by Government of India.', features: ['Revolving credit facility', 'No processing fee', 'Repay after harvest season', 'Covers crop insurance too'] },
  { id: 2, name: 'Equipment Finance Loan', interest: '8.5%', max: '₹5,00,000', badge: 'Private', badgeClass: 'badge-info', desc: 'Quick financing for tractors, harvesters, pumps, and irrigation infrastructure.', features: ['Same-day approval', 'Flexible EMI tenure (1–5 yr)', 'Minimal documentation', 'Insurance included'] },
  { id: 3, name: 'Land Development Loan', interest: '6%', max: '₹10,00,000', badge: 'NABARD', badgeClass: 'badge-warning', desc: 'Long-term financing for leveling, bunding, irrigation wells, and farm development.', features: ['15 year tenure', 'Subsidy of 30% for SC/ST', 'Requires land records', 'Via nearest Gramin Bank'] },
];

const insurances = [
  { id: 1, name: 'PMFBY Season Guard', premium: '2%', coverage: 'Full crop loss', badge: 'Recommended', badgeClass: 'badge-warning', desc: 'Pradhan Mantri Fasal Bima Yojana covers losses due to drought, unseasonal rain, pests, and flood.', features: ['100% loss coverage post-harvest', 'Premium subsidized by Govt', 'Claim within 72 hrs of loss', 'Online claim tracking'] },
  { id: 2, name: 'Weather Shield Insurance', premium: '1.5%', coverage: 'Weather damage', badge: 'Popular', badgeClass: 'badge-info', desc: 'Index-based insurance that auto-triggers payouts when weather thresholds are breached.', features: ['No manual claim filing', 'Payout within 2 weeks', 'Covers deficit rainfall', 'Data from IMD weather stations'] },
];

export default function LoansInsurance() {
  const [applyModal, setApplyModal] = useState(null); // holds the product
  const [emiModal, setEmiModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', land: '', crop: '' });
  const [emi, setEmi] = useState({ amount: '', rate: '', tenure: '' });
  const [emiResult, setEmiResult] = useState(null);

  const handleApply = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setApplyModal(null); setForm({ name: '', phone: '', land: '', crop: '' }); }, 2000);
  };

  const calculateEmi = () => {
    const P = Number(emi.amount);
    const r = Number(emi.rate) / 12 / 100;
    const n = Number(emi.tenure) * 12;
    if (!P || !r || !n) return;
    const emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmiResult({ monthly: emiVal.toFixed(0), total: (emiVal * n).toFixed(0), interest: ((emiVal * n) - P).toFixed(0) });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Microloans & Insurance</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Financial products curated for small-scale farmers.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setEmiModal(true)}><Calculator size={16} /> EMI Calculator</button>
      </div>

      {/* Loans */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Banknote style={{ color: 'var(--color-primary)' }} /> Available Microloans
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        {loans.map((loan) => (
          <div key={loan.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontWeight: 700 }}>{loan.name}</h3>
              <span className={`badge ${loan.badgeClass}`}>{loan.badge}</span>
            </div>
            <p className="text-muted text-sm">{loan.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div><p className="text-sm text-muted">Interest Rate</p><p className="font-bold">{loan.interest} p.a.</p></div>
              <div><p className="text-sm text-muted">Max Amount</p><p className="font-bold">{loan.max}</p></div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {loan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEmiModal(true)}><Calculator size={14} /> EMI</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setApplyModal({ ...loan, productType: 'loan' })}>Apply Now →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Insurance */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <ShieldCheck style={{ color: 'var(--color-secondary)' }} /> Crop Insurance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insurances.map((ins) => (
          <div key={ins.id} className="card" style={{ borderTop: '4px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontWeight: 700 }}>{ins.name}</h3>
              <span className={`badge ${ins.badgeClass}`}>{ins.badge}</span>
            </div>
            <p className="text-muted text-sm">{ins.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div><p className="text-sm text-muted">Premium Rate</p><p className="font-bold">{ins.premium} of sum insured</p></div>
              <div><p className="text-sm text-muted">Coverage</p><p className="font-bold">{ins.coverage}</p></div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {ins.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-secondary w-full" onClick={() => setApplyModal({ ...ins, productType: 'insurance' })}>Get Quote &amp; Apply →</button>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={!!applyModal} onClose={() => setApplyModal(null)} title={applyModal ? `📋 Apply — ${applyModal.name}` : ''} size="md">
        {submitted ? (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>Application Submitted!</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Our agent will contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleApply}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="input-field" placeholder="Raju Reddy" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" className="input-field" placeholder="9XXXXXXXXX" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Land Owned (Acres)</label>
                <input type="number" className="input-field" placeholder="e.g. 5" required value={form.land} onChange={(e) => setForm({ ...form, land: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Primary Crop</label>
                <select className="input-field" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} required>
                  <option value="">Select</option>
                  {['Wheat', 'Cotton', 'Rice', 'Maize', 'Chilli', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setApplyModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Application</button>
            </div>
          </form>
        )}
      </Modal>

      {/* EMI Calculator Modal */}
      <Modal isOpen={emiModal} onClose={() => { setEmiModal(false); setEmiResult(null); }} title="🧮 EMI Calculator" size="sm">
        <div className="form-group">
          <label>Loan Amount (₹)</label>
          <input type="number" className="input-field" placeholder="e.g. 100000" value={emi.amount} onChange={(e) => setEmi({ ...emi, amount: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Interest Rate (% p.a.)</label>
            <input type="number" className="input-field" placeholder="e.g. 7" value={emi.rate} onChange={(e) => setEmi({ ...emi, rate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Tenure (Years)</label>
            <input type="number" className="input-field" placeholder="e.g. 3" value={emi.tenure} onChange={(e) => setEmi({ ...emi, tenure: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary w-full" onClick={calculateEmi}>Calculate EMI</button>
        {emiResult && (
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Monthly EMI', value: `₹${Number(emiResult.monthly).toLocaleString()}`, color: 'var(--color-primary)' },
              { label: 'Total Payable', value: `₹${Number(emiResult.total).toLocaleString()}`, color: 'var(--color-info)' },
              { label: 'Total Interest', value: `₹${Number(emiResult.interest).toLocaleString()}`, color: 'var(--color-danger)' },
            ].map((r) => (
              <div key={r.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)' }}>
                <p className="text-sm text-muted">{r.label}</p>
                <p style={{ fontWeight: 700, color: r.color, fontSize: '1rem', marginTop: '0.25rem' }}>{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
