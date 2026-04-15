import React, { useState } from 'react';
import { Plus, Download, ArrowUpRight, ArrowDownRight, Trash2, Filter } from 'lucide-react';
import Modal from '../components/Modal';

const initialTx = [
  { id: 1, date: '2026-04-10', description: 'Sold Wheat (20 Qtl)', category: 'Crop Sale', amount: 45000, type: 'credit' },
  { id: 2, date: '2026-04-05', description: 'Fertilizer & Pesticide', category: 'Input', amount: 8500, type: 'debit' },
  { id: 3, date: '2026-04-01', description: 'Tractor Rent', category: 'Equipment', amount: 3900, type: 'debit' },
  { id: 4, date: '2026-03-28', description: 'Government Subsidy', category: 'Subsidy', amount: 6000, type: 'credit' },
  { id: 5, date: '2026-03-20', description: 'Sold Cotton (5 Qtl)', category: 'Crop Sale', amount: 37000, type: 'credit' },
  { id: 6, date: '2026-03-15', description: 'Labour Wages', category: 'Labour', amount: 7200, type: 'debit' },
];

const categories = ['All', 'Crop Sale', 'Input', 'Equipment', 'Subsidy', 'Labour'];

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState(initialTx);
  const [filterCat, setFilterCat] = useState('All');
  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ date: '', description: '', category: 'Crop Sale', amount: '', type: 'credit' });

  const filtered = filterCat === 'All' ? transactions : transactions.filter(t => t.category === filterCat);
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = (e) => {
    e.preventDefault();
    const newTx = { ...form, id: Date.now(), amount: Number(form.amount) };
    setTransactions([newTx, ...transactions]);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAddModal(false); setForm({ date: '', description: '', category: 'Crop Sale', amount: '', type: 'credit' }); }, 1800);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Finance Tracker</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Track every rupee — income and expenses.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => alert('Report exported as CSV!')}><Download size={16} /> Export</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}><Plus size={16} /> Add Entry</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderTop: `4px solid ${balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`, textAlign: 'center' }}>
          <p className="text-muted">Net Balance</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            ₹{balance.toLocaleString()}
          </h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--color-info)', textAlign: 'center' }}>
          <p className="text-muted">Total Income</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--color-info)' }}>₹{totalIncome.toLocaleString()}</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--color-danger)', textAlign: 'center' }}>
          <p className="text-muted">Total Expenses</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--color-danger)' }}>₹{totalExpense.toLocaleString()}</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map((c) => (
          <button key={c} className={`btn ${filterCat === c ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)' }}>
                {['Date', 'Description', 'Category', 'Amount', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-base)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>{tx.description}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge" style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>{tx.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: tx.type === 'credit' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      ₹{tx.amount.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => setDeleteId(tx.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No transactions in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="➕ Add Transaction" size="md">
        {submitted ? (
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h3>Transaction Added!</h3>
          </div>
        ) : (
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>Type</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['credit', 'debit'].map((t) => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                    {t === 'credit' ? '💰 Income' : '💸 Expense'}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="input-field" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" className="input-field" placeholder="e.g. 5000" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" className="input-field" placeholder="e.g. Sold Wheat (10 Qtl)" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Transaction</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="🗑️ Confirm Delete" size="sm">
        <p>Are you sure you want to delete this transaction? This cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn" style={{ background: 'var(--color-danger)', color: 'white' }} onClick={() => handleDelete(deleteId)}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
}
