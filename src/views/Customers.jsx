import { useState } from 'react';
import { Search, Plus, UserCheck, Edit, Trash2, Phone, MessageSquare } from 'lucide-react';

const Customers = ({ customers, deleteCustomer, onOpenAddModal, onOpenEditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = ['all', 'VIP', 'Regular', 'Outstanding'];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'VIP') matchesFilter = c.balance > 50000;
    else if (activeFilter === 'Regular') matchesFilter = c.balance <= 50000 && c.balance >= 0;
    else if (activeFilter === 'Outstanding') matchesFilter = c.balance > 0;
    
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0) + 
    customers.reduce((acc, c) => acc + Math.abs(Math.min(0, c.balance)), 0);
  const totalDue = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);

  return (
    <div>
      {/* Mobile View Header */}
      <div className="mobile-view-header">
        <h1>Customers</h1>
        <p>Manage your business relationships</p>
      </div>

      {/* Mobile Bento Summary */}
      <div className="mobile-bento">
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Total Revenue</div>
          <div className="mobile-bento-value" style={{ color: 'var(--primary)' }}>₹{(totalRevenue / 100000).toFixed(1)}L</div>
        </div>
        <div className="mobile-bento-card" style={{ border: '1px solid rgba(220,38,38,0.2)' }}>
          <div className="mobile-bento-label" style={{ color: 'var(--danger)' }}>Total Due</div>
          <div className="mobile-bento-value" style={{ color: 'var(--danger)' }}>₹{(totalDue / 100000).toFixed(1)}L</div>
        </div>
      </div>

      {/* Mobile Search & Filter */}
      <div className="mobile-search-bar">
        <div className="mobile-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
        </div>
        <div className="mobile-filter-chips">
          {filters.map(f => (
            <button 
              key={f} 
              className={`mobile-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-card-list">
        {filteredCustomers.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <UserCheck size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No Customers Found</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add a customer to track invoices and credits.</p>
          </div>
        ) : (
          filteredCustomers.map(c => {
            const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const isVip = c.balance > 50000;
            const hasOutstanding = c.balance > 0;
            
            return (
              <div key={c.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-left">
                    <div className={`mobile-card-avatar ${isVip ? 'primary' : 'success'}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="mobile-card-title">{c.name}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span style={{ 
                          background: isVip ? 'var(--primary-light)' : 'var(--bg-main)', 
                          color: isVip ? 'var(--primary)' : 'var(--text-muted)', 
                          padding: '2px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 600 
                        }}>
                          {isVip ? 'VIP' : 'Regular'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Sales</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                      ₹{c.balance > 0 ? (c.balance + Math.abs(c.balance)).toLocaleString('en-IN') : Math.abs(c.balance).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: hasOutstanding ? 'var(--danger)' : 'var(--success)', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: hasOutstanding ? 'var(--danger)' : 'var(--success)', marginTop: 2 }}>
                      {hasOutstanding ? `₹${c.balance.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${c.phone}`} className="mobile-card-action-btn" style={{ textDecoration: 'none' }}>
                      <Phone size={14} />
                    </a>
                    <a href={`https://wa.me/91${c.phone}`} className="mobile-card-action-btn success" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <MessageSquare size={14} />
                    </a>
                    <button className="mobile-card-action-btn primary" onClick={() => onOpenEditModal(c)}>
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View Header */}
      <div className="view-header">
        <div>
          <h2>Customers Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Maintain client relationships, trace outstanding balances, and check billing details</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Desktop Table */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, phone, city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <table className="app-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>GSTIN</th>
              <th>City</th>
              <th>State</th>
              <th style={{ textAlign: 'right' }}>Outstanding balance</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <UserCheck size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Customers Found</p>
                  <p style={{ fontSize: '0.8rem' }}>Create a client profile to track invoices and outstanding credits.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email || 'N/A'}</td>
                  <td>
                    {c.gstin ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{c.gstin}</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Consumer</span>
                    )}
                  </td>
                  <td>{c.city}</td>
                  <td>{c.state}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: c.balance > 0 ? '#dc2626' : c.balance < 0 ? '#059669' : '#0f172a' }}>
                    {c.balance > 0 ? `₹${c.balance.toLocaleString('en-IN')}` : c.balance < 0 ? `-₹${Math.abs(c.balance).toLocaleString('en-IN')}` : 'Settled (₹0)'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => onOpenEditModal(c)}
                        title="Edit Customer"
                        style={{ color: '#2563eb' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${c.name}?`)) {
                            deleteCustomer(c.id);
                          }
                        }}
                        title="Delete Customer"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
