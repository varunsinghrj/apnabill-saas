import { useState } from 'react';
import { Search, Plus, Truck, Edit, Trash2, Phone, Mail } from 'lucide-react';

const Suppliers = ({ suppliers, deleteSupplier, onOpenAddModal, onOpenEditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = ['all', 'Raw Materials', 'Logistics', 'Packaging'];

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchesCategory = activeFilter === 'all' || s.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const getHealthScore = (supplier) => {
    if (supplier.dues === 0) return 90;
    if (supplier.dues < 50000) return 75;
    return 45;
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      {/* Mobile View Header */}
      <div className="mobile-view-header">
        <h1>Suppliers</h1>
        <p>Manage wholesale suppliers, trace purchases, and monitor outstanding payables</p>
      </div>

      {/* Mobile Search & Filter */}
      <div className="mobile-search-bar">
        <div className="mobile-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
        </div>
        <div className="mobile-filter-chips">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`mobile-chip ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === 'all' ? 'All Suppliers' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-card-list">
        {filteredSuppliers.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <Truck size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No Suppliers Found</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add a supplier to start tracking purchases.</p>
          </div>
        ) : (
          filteredSuppliers.map(s => {
            const health = getHealthScore(s);
            const circumference = 2 * Math.PI * 18;
            const offset = circumference - (health / 100) * circumference;
            
            return (
              <div key={s.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-left">
                    <div className="mobile-card-avatar primary">
                      <Truck size={18} />
                    </div>
                    <div>
                      <div className="mobile-card-title">{s.name}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 600 }}>
                          {s.category || 'Supplier'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="3" />
                        <circle cx="22" cy="22" r="18" fill="none" stroke={getHealthColor(health)} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} />
                      </svg>
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: getHealthColor(health) }}>
                        {health}%
                      </span>
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>Health</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.dues > 0 ? 'var(--danger)' : 'var(--text-main)', marginTop: 2 }}>
                      {s.dues > 0 ? `₹${s.dues.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contact</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 2 }}>{s.phone || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} style={{ color: 'var(--text-muted)' }}>
                        <Phone size={16} />
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} style={{ color: 'var(--text-muted)' }}>
                        <Mail size={16} />
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="mobile-card-action-btn primary" onClick={() => onOpenEditModal(s)}>
                      <Edit size={14} />
                    </button>
                    <button className="mobile-card-action-btn danger" onClick={() => {
                      if (confirm(`Delete ${s.name}?`)) deleteSupplier(s.id);
                    }}>
                      <Trash2 size={14} />
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
          <h2>Suppliers Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage wholesale suppliers, trace purchases, and monitor outstanding payables</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Desktop Table */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, contact, phone..." 
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
              <th>Supplier / Business Name</th>
              <th>Contact Person</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>GSTIN</th>
              <th style={{ textAlign: 'right' }}>Outstanding Payables</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <Truck size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Suppliers Found</p>
                  <p style={{ fontSize: '0.8rem' }}>Add a supplier to record purchase stock replenishments on credit.</p>
                </td>
              </tr>
            ) : (
              filteredSuppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                  </td>
                  <td>{s.contactPerson || 'N/A'}</td>
                  <td>{s.phone}</td>
                  <td>{s.email || 'N/A'}</td>
                  <td>
                    {s.gstin ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{s.gstin}</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unregistered</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: s.dues > 0 ? '#dc2626' : '#0f172a' }}>
                    {s.dues > 0 ? `₹${s.dues.toLocaleString('en-IN')}` : 'Paid (₹0)'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => onOpenEditModal(s)}
                        title="Edit Supplier"
                        style={{ color: '#2563eb' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                            deleteSupplier(s.id);
                          }
                        }}
                        title="Delete Supplier"
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

export default Suppliers;
