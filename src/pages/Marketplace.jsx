import React, { useState } from 'react';
import { ShoppingCart, Phone, Plus, Search, Filter, MessageSquare, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';

const buyers = [
  { id: 1, name: 'Reliance Fresh Procurement', demand: 'Wheat, Cotton', qty: '500 Qtl', price: '₹2,300/Qtl', location: 'Hyderabad', contact: '+91 98491 12345', rating: '4.8 ⭐', verified: true },
  { id: 2, name: 'Local Millers Association', demand: 'Rice (Paddy)', qty: '200 Qtl', price: '₹2,150/Qtl', location: 'Nizamabad', contact: '+91 90001 23456', rating: '4.5 ⭐', verified: true },
  { id: 3, name: 'ITC Agri Business', demand: 'Maize', qty: '1000 Qtl', price: '₹1,900/Qtl', location: 'Warangal', contact: '+91 91234 56789', rating: '4.9 ⭐', verified: true },
  { id: 4, name: 'Sunrise Oils Pvt Ltd', demand: 'Groundnut, Soybean', qty: '300 Qtl', price: '₹5,600/Qtl', location: 'Guntur', contact: '+91 99001 87654', rating: '4.3 ⭐', verified: false },
  { id: 5, name: 'Spice Board Export Hub', demand: 'Chilli, Turmeric', qty: '150 Qtl', price: '₹18,800/Qtl', location: 'Khammam', contact: '+91 97001 11223', rating: '4.7 ⭐', verified: true },
];

export default function Marketplace() {
  const [postModal, setPostModal] = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ crop: '', qty: '', unit: 'Qtl', price: '', location: '', notes: '' });
  const [message, setMessage] = useState('');

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.demand.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const handlePost = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setPostModal(false); setForm({ crop: '', qty: '', unit: 'Qtl', price: '', location: '', notes: '' }); }, 2000);
  };

  const handleMessage = (e) => {
    e.preventDefault();
    setMsgSent(true);
    setTimeout(() => { setMsgSent(false); setContactModal(null); setMessage(''); }, 1800);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Direct Marketplace</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Connect directly with verified buyers — no middlemen.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPostModal(true)}><Plus size={18} /> Post Your Yield</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Active Buyers', value: buyers.length },
          { label: 'Verified Buyers', value: buyers.filter(b => b.verified).length, color: 'var(--color-success)' },
          { label: 'Avg. Demand (Qtl)', value: '430', color: 'var(--color-info)' },
          { label: 'Your Listings', value: '0', color: 'var(--color-secondary)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <h2 style={{ color: s.color || 'var(--color-text-main)', fontSize: '1.75rem', fontWeight: 'bold' }}>{s.value}</h2>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '480px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input type="text" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Search buyers, crops, or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Buyer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((buyer) => (
          <div key={buyer.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {buyer.name}
                  {buyer.verified && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                </h3>
                <p className="text-sm text-muted">{buyer.location}</p>
              </div>
              <span className="badge badge-info">{buyer.rating}</span>
            </div>

            <div style={{ background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Looking for:</span>
                <span className="font-semibold">{buyer.demand}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Quantity Needed:</span>
                <span className="font-semibold">{buyer.qty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Offering:</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{buyer.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              <button className="btn btn-outline" style={{ flex: 1, gap: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setContactModal(buyer)}>
                <MessageSquare size={15} /> Message
              </button>
              <button className="btn btn-primary" style={{ flex: 1, gap: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => alert(`Calling ${buyer.contact}`)}>
                <Phone size={15} /> Call Now
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No buyers found.</div>
        )}
      </div>

      {/* Post Yield Modal */}
      <Modal isOpen={postModal} onClose={() => setPostModal(false)} title="🌾 Post Your Crop for Sale" size="md">
        {submitted ? (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>Your listing is live!</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Buyers will contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handlePost}>
            <div className="form-row">
              <div className="form-group">
                <label>Crop Name</label>
                <select className="input-field" required value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
                  <option value="">Select Crop</option>
                  {['Wheat', 'Cotton', 'Rice', 'Maize', 'Chilli', 'Groundnut', 'Soybean', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Your Location</label>
                <input type="text" className="input-field" placeholder="e.g. Warangal" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity Available</label>
                <input type="number" className="input-field" placeholder="e.g. 50" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select className="input-field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option>Qtl</option><option>Kg</option><option>Ton</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Your Expected Price (₹ per {form.unit})</label>
              <input type="number" className="input-field" placeholder="e.g. 2300" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea className="input-field" rows="2" placeholder="Quality grade, storage condition, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setPostModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Post Listing</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Contact Buyer Modal */}
      <Modal isOpen={!!contactModal} onClose={() => setContactModal(null)} title={contactModal ? `💬 Contact — ${contactModal.name}` : ''} size="sm">
        {msgSent ? (
          <div className="success-box">
            <div className="success-icon">📨</div>
            <h3>Message Sent!</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>The buyer will respond within a few hours.</p>
          </div>
        ) : contactModal && (
          <form onSubmit={handleMessage}>
            <div style={{ padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <p><strong>📍</strong> {contactModal.location}</p>
              <p style={{ marginTop: '0.25rem' }}><strong>📞</strong> {contactModal.contact}</p>
              <p style={{ marginTop: '0.25rem' }}><strong>💰</strong> Offering {contactModal.price}</p>
            </div>
            <div className="form-group">
              <label>Your Message</label>
              <textarea className="input-field" rows="4" placeholder="Hi, I have wheat available for sale. Can we discuss?" required value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setContactModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
