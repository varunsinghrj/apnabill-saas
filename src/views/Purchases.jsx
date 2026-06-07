import { useState } from 'react';
import { Search, Plus, ShoppingCart, X, IndianRupee } from 'lucide-react';

const Purchases = ({ 
  purchases, 
  suppliers, 
  onOpenPurchaseModal, 
  recordSupplierPayment 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Supplier Outgoing Payment Modal state
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [paySuppId, setPaySuppId] = useState('');
  const [payAmount, setPayAmount] = useState('');

  // Calculations
  const totalPurchases = purchases.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalDues = suppliers.reduce((acc, curr) => acc + curr.dues, 0);

  const filteredPurchases = purchases.filter(po => {
    const matchesSearch = 
      po.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : po.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!paySuppId || !payAmount || Number(payAmount) <= 0) {
      alert('Please select a supplier and enter a valid amount.');
      return;
    }
    recordSupplierPayment(paySuppId, Number(payAmount));
    alert(`Success: Recorded payment of ₹${Number(payAmount).toLocaleString('en-IN')} to supplier!`);
    setIsPayOpen(false);
    setPaySuppId('');
    setPayAmount('');
  };

  return (
    <div>
      {/* Mobile View Header */}
      <div className="mobile-view-header">
        <h1>Purchases & POs</h1>
        <p>Record purchases, monitor invoices, and manage payment credits</p>
        <div className="mobile-view-header-actions">
          <button className="btn btn-success" onClick={() => setIsPayOpen(true)} style={{ flex: 1 }}>
            <IndianRupee size={16} /> Pay Supplier
          </button>
          <button className="btn btn-primary" onClick={onOpenPurchaseModal} style={{ flex: 1 }}>
            <Plus size={16} /> New Purchase
          </button>
        </div>
      </div>

      {/* Mobile Bento Summary */}
      <div className="mobile-bento">
        <div className="mobile-bento-card full-width highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="mobile-bento-label" style={{ opacity: 0.8 }}>Total Payables</div>
              <div className="mobile-bento-value large">₹{totalPurchases.toLocaleString('en-IN')}</div>
            </div>
            {totalDues > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>OVERDUE</span>
            )}
          </div>
          <div className="mobile-progress" style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)' }}>
            <div className="mobile-progress-fill" style={{ width: `${Math.min(100, (totalDues / (totalPurchases || 1)) * 100)}%`, background: 'white' }}></div>
          </div>
          <div className="mobile-bento-trend" style={{ opacity: 0.8, marginTop: 4 }}>
            {totalDues > 0 ? `${Math.round((totalDues / totalPurchases) * 100)}% of credit limit used` : 'All dues settled'}
          </div>
        </div>
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Pending</div>
          <div className="mobile-bento-value">{purchases.filter(p => p.paymentStatus === 'Pending').length} POs</div>
        </div>
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Received</div>
          <div className="mobile-bento-value">{purchases.filter(p => p.status === 'Received').length} Items</div>
        </div>
      </div>

      {/* Mobile Search & Filter */}
      <div className="mobile-search-bar">
        <div className="mobile-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search POs, Suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
        </div>
        <div className="mobile-filter-chips">
          <button className={`mobile-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All Time</button>
          <button className={`mobile-chip ${statusFilter === 'Paid' ? 'active' : ''}`} onClick={() => setStatusFilter('Paid')}>Paid</button>
          <button className={`mobile-chip ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>Pending</button>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-card-list">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4, marginBottom: 4 }}>
          Recent Purchase Orders
        </div>
        {filteredPurchases.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <ShoppingCart size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No Purchase Orders</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create your first purchase order.</p>
          </div>
        ) : (
          filteredPurchases.map(po => (
            <div key={po.poNo} className="mobile-card">
              <div className="mobile-card-header">
                <div className="mobile-card-left">
                  <div className={`mobile-card-avatar ${po.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <div className="mobile-card-title">{po.supplierName}</div>
                    <div className="mobile-card-subtitle">{po.poNo} • {po.date}</div>
                  </div>
                </div>
                <span className={`badge ${po.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                  {po.paymentStatus}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">Status</span>
                  <span className="mobile-card-stat-value">{po.status}</span>
                </div>
                <div className="mobile-card-stat" style={{ textAlign: 'right' }}>
                  <span className="mobile-card-stat-label">Grand Total</span>
                  <span className="mobile-card-stat-value primary">₹{po.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View Header */}
      <div className="view-header">
        <div>
          <h2>Purchases & Goods Inward</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Record purchases from wholesalers, monitor invoices, and manage payment credits</p>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-success" onClick={() => setIsPayOpen(true)}>
            <IndianRupee size={16} /> Pay Supplier
          </button>
          <button className="btn btn-primary" onClick={onOpenPurchaseModal}>
            <Plus size={16} /> Record Purchase
          </button>
        </div>
      </div>

      {/* Desktop Mini Stats Card */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Total Purchase Orders</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0' }}>₹{totalPurchases.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Outstanding Supplier Dues</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0', color: totalDues > 0 ? '#dc2626' : 'inherit' }}>₹{totalDues.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table grid control */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search Purchase Order # or Supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="table-filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="table-select"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* PO Table */}
        <table className="app-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier / Wholesaler</th>
              <th>Order Date</th>
              <th style={{ textAlign: 'right' }}>Taxable Amt (₹)</th>
              <th style={{ textAlign: 'right' }}>GST Tax (₹)</th>
              <th style={{ textAlign: 'right' }}>Grand Total (₹)</th>
              <th style={{ textAlign: 'center' }}>Receipt Status</th>
              <th style={{ textAlign: 'center' }}>Payment</th>
              <th style={{ textAlign: 'right' }}>Amt Paid (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <ShoppingCart size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Purchase Orders found</p>
                  <p style={{ fontSize: '0.8rem' }}>Replenish inventory stock by creating a purchase log entry.</p>
                </td>
              </tr>
            ) : (
              filteredPurchases.map(po => (
                <tr key={po.poNo}>
                  <td style={{ fontWeight: 700 }}>{po.poNo}</td>
                  <td>{po.supplierName}</td>
                  <td>{po.date}</td>
                  <td style={{ textAlign: 'right' }}>₹{po.subtotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>₹{po.taxAmount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{po.grandTotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">{po.status}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${po.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                      {po.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 500 }}>₹{po.amountPaid.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Outgoing Payment Modal */}
      {isPayOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Supplier Cash Outflow</h3>
              <button className="icon-btn" onClick={() => setIsPayOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePaySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Wholesaler *</label>
                  <select 
                    value={paySuppId} 
                    onChange={(e) => setPaySuppId(e.target.value)} 
                    className="form-control"
                    required
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.filter(s => s.dues > 0).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - Outstanding Dues: ₹{s.dues.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Made (₹) *</label>
                  <div className="input-addon-group">
                    <span className="input-addon-left">₹</span>
                    <input 
                      type="number" 
                      value={payAmount} 
                      onChange={(e) => setPayAmount(e.target.value)} 
                      className="form-control input-with-addon-left" 
                      required 
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPayOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment Made</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Purchases;
