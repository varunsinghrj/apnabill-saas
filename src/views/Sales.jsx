import { useState } from 'react';
import { Search, Plus, Printer, FileText, ArrowLeft, CreditCard, X, CheckCircle, Trash2 } from 'lucide-react';

const Sales = ({ 
  invoices, 
  customers, 
  recordCustomerPayment, 
  changePaymentStatus,
  deleteInvoice,
  onOpenInvoiceModal,
  settings 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payCustId, setPayCustId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');

  const [isPartialPayOpen, setIsPartialPayOpen] = useState(false);
  const [partialPayAmount, setPartialPayAmount] = useState('');
  const [partialPayMode, setPartialPayMode] = useState('UPI');

  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [changeStatusValue, setChangeStatusValue] = useState('');
  const [changeStatusAmount, setChangeStatusAmount] = useState('');
  const [changeStatusMode, setChangeStatusMode] = useState('UPI');

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const pendingCollection = Math.max(0, totalInvoiced - totalCollected);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = paymentFilter === 'all' ? true : inv.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payCustId || !payAmount || Number(payAmount) <= 0) {
      alert('Please select a customer and enter a valid payment amount.');
      return;
    }
    recordCustomerPayment(payCustId, Number(payAmount), payMode);
    alert(`Success: Recorded payment of ₹${Number(payAmount).toLocaleString('en-IN')}!`);
    setIsPayOpen(false);
    setPayCustId('');
    setPayAmount('');
  };

  const handlePartialPay = () => {
    const amount = Number(partialPayAmount);
    const due = selectedInvoice.grandTotal - selectedInvoice.amountPaid;
    if (!amount || amount <= 0 || amount > due) {
      alert(`Enter amount between ₹1 and ₹${due.toLocaleString('en-IN')}`);
      return;
    }
    recordCustomerPayment(selectedInvoice.customerId, amount, partialPayMode);
    const updatedInv = { ...selectedInvoice, amountPaid: selectedInvoice.amountPaid + amount };
    if (updatedInv.amountPaid >= updatedInv.grandTotal) updatedInv.paymentStatus = 'Paid';
    else updatedInv.paymentStatus = 'Partially Paid';
    setSelectedInvoice(updatedInv);
    setIsPartialPayOpen(false);
    setPartialPayAmount('');
    alert(`Recorded ₹${amount.toLocaleString('en-IN')} payment!`);
  };

  const handleChangePaymentStatus = () => {
    if (!changeStatusValue) {
      alert('Please select a payment status.');
      return;
    }
    let newAmountPaid = selectedInvoice.amountPaid;
    if (changeStatusValue === 'Paid') {
      newAmountPaid = selectedInvoice.grandTotal;
    } else if (changeStatusValue === 'Unpaid') {
      newAmountPaid = 0;
    } else if (changeStatusValue === 'Partially Paid') {
      const amt = Number(changeStatusAmount);
      if (!amt || amt <= 0 || amt >= selectedInvoice.grandTotal) {
        alert(`Enter amount between ₹1 and ₹${(selectedInvoice.grandTotal - 0.01).toLocaleString('en-IN')}`);
        return;
      }
      newAmountPaid = amt;
    }
    changePaymentStatus(selectedInvoice.invoiceNo, changeStatusValue, newAmountPaid, changeStatusMode);
    const updatedInv = { ...selectedInvoice, paymentStatus: changeStatusValue, amountPaid: newAmountPaid, paymentMode: changeStatusMode };
    setSelectedInvoice(updatedInv);
    setIsChangeStatusOpen(false);
    setChangeStatusValue('');
    setChangeStatusAmount('');
    alert(`Payment status changed to "${changeStatusValue}"!`);
  };

  const triggerPrint = () => window.print();

  // ─── DETAILED INVOICE VIEW ───
  if (selectedInvoice) {
    const isInterstate = selectedInvoice.customerId && 
      customers.find(c => c.id === selectedInvoice.customerId)?.state !== 'Uttar Pradesh';
    const matchingCustomer = customers.find(c => c.id === selectedInvoice.customerId);
    const outstanding = selectedInvoice.grandTotal - selectedInvoice.amountPaid;

    return (
      <div className="print-invoice-area">
        {/* Action buttons */}
        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)} style={{ flex: '1 1 auto' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn btn-primary" onClick={triggerPrint} style={{ flex: '1 1 auto' }}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-danger" onClick={() => { if (confirm(`Delete invoice ${selectedInvoice.invoiceNo}? This will restore stock and adjust customer balance.`)) { deleteInvoice(selectedInvoice.invoiceNo); setSelectedInvoice(null); } }} style={{ flex: '1 1 auto' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>

        {/* Invoice card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Invoice header */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white', padding: '20px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{settings.businessName || 'Vyapora'}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 4, lineHeight: 1.5 }}>
                  {settings.address && <>{settings.address}<br /></>}
                  {settings.contactNo && <>Ph: {settings.contactNo}<br /></>}
                  {settings.email && <>Email: {settings.email}<br /></>}
                  <strong>GSTIN:</strong> {settings.gstin || 'Unregistered'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>TAX INVOICE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8 }}>{selectedInvoice.invoiceNo}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 2 }}>Date: {selectedInvoice.date}</div>
              </div>
            </div>
          </div>

          {/* Status banner */}
          {outstanding > 0 && (
            <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Payment Pending</span>
              <button className="btn btn-success btn-sm" onClick={() => { setChangeStatusValue(''); setIsChangeStatusOpen(true); }} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                Change Payment Status
              </button>
            </div>
          )}
          {outstanding <= 0 && (
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Fully Paid</span>
            </div>
          )}

          <div style={{ padding: '16px' }}>
            {/* Billed To + Payment Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>Billed To</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: '#0f172a' }}>{selectedInvoice.customerName}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>
                  {matchingCustomer ? (
                    <>
                      {matchingCustomer.state && <>State: {matchingCustomer.state}<br /></>}
                      {matchingCustomer.phone && <>Ph: {matchingCustomer.phone}<br /></>}
                      {matchingCustomer.gstin && <>GSTIN: {matchingCustomer.gstin}</>}
                    </>
                  ) : 'Walk-in Cash Client'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Supply</div>
                <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: 4 }}>{matchingCustomer?.state || 'Uttar Pradesh'}</div>
              </div>
            </div>

            {/* Payment breakdown */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Total Invoice</span>
                <strong>₹{selectedInvoice.grandTotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Amount Collected</span>
                <strong style={{ color: '#059669' }}>₹{selectedInvoice.amountPaid.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Outstanding Dues</span>
                <strong style={{ color: '#dc2626' }}>₹{outstanding.toFixed(2)}</strong>
              </div>
            </div>

            {/* Items - mobile card layout */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Items ({selectedInvoice.items.length})</div>
              {selectedInvoice.items.map((item, index) => (
                <div key={index} style={{ borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>₹{item.price.toFixed(2)} × {item.qty} + {item.taxRate}% GST</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.85rem', marginLeft: 8 }}>₹{item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '2px solid #1e3a8a', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4, color: '#dc2626' }}>
                  <span>Discount</span>
                  <span>-₹{selectedInvoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>GST</span>
                <span>₹{selectedInvoice.taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                <span>Grand Total</span>
                <span>₹{selectedInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Generated via <strong>Vyapora</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', width: 100, marginBottom: 4 }}></div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Signatory</div>
              </div>
            </div>
          </div>
        </div>

        {/* Partial Payment Modal */}
        {isPartialPayOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Record Payment for {selectedInvoice.invoiceNo}</h3>
                <button className="icon-btn" onClick={() => setIsPartialPayOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Invoice Total</span>
                    <strong>₹{selectedInvoice.grandTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Already Paid</span>
                    <strong style={{ color: '#059669' }}>₹{selectedInvoice.amountPaid.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: 6, color: '#dc2626' }}>
                    <span>Remaining Dues</span>
                    <span>₹{outstanding.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (₹) *</label>
                  <div className="input-addon-group">
                    <span className="input-addon-left">₹</span>
                    <input 
                      type="number" 
                      value={partialPayAmount} 
                      onChange={(e) => setPartialPayAmount(e.target.value)} 
                      className="form-control input-with-addon-left" 
                      placeholder={`Max: ₹${outstanding.toFixed(2)}`}
                      min="1"
                      max={outstanding}
                      step="0.01"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPartialPayAmount(String(Math.round(outstanding / 2)))} style={{ flex: 1, fontSize: '0.75rem' }}>50%</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPartialPayAmount(String(outstanding))} style={{ flex: 1, fontSize: '0.75rem' }}>Full ₹{outstanding.toFixed(2)}</button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select value={partialPayMode} onChange={(e) => setPartialPayMode(e.target.value)} className="form-control">
                    <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Net Banking / IMPS</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsPartialPayOpen(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handlePartialPay}>Record Payment</button>
              </div>
            </div>
          </div>
        )}

        {/* Change Payment Status Modal */}
        {isChangeStatusOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Change Payment Status - {selectedInvoice.invoiceNo}</h3>
                <button className="icon-btn" onClick={() => setIsChangeStatusOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Invoice Total</span>
                    <strong>₹{selectedInvoice.grandTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Current Status</span>
                    <strong>{selectedInvoice.paymentStatus}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Amount Paid</span>
                    <strong style={{ color: '#059669' }}>₹{selectedInvoice.amountPaid.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Payment Status *</label>
                  <select value={changeStatusValue} onChange={(e) => setChangeStatusValue(e.target.value)} className="form-control">
                    <option value="">-- Select Status --</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                {changeStatusValue === 'Partially Paid' && (
                  <div className="form-group">
                    <label className="form-label">Amount Paid (₹) *</label>
                    <div className="input-addon-group">
                      <span className="input-addon-left">₹</span>
                      <input 
                        type="number" 
                        value={changeStatusAmount} 
                        onChange={(e) => setChangeStatusAmount(e.target.value)} 
                        className="form-control input-with-addon-left" 
                        placeholder={`Max: ₹${(selectedInvoice.grandTotal - 0.01).toFixed(2)}`}
                        min="1"
                        max={selectedInvoice.grandTotal - 0.01}
                        step="0.01"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select value={changeStatusMode} onChange={(e) => setChangeStatusMode(e.target.value)} className="form-control">
                    <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Net Banking / IMPS</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsChangeStatusOpen(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleChangePaymentStatus}>Change Status</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── INVOICE LIST VIEW ───
  return (
    <div>
      {/* Mobile View Header */}
      <div className="mobile-view-header">
        <h1>Sales & Invoices</h1>
        <p>Record sales transactions, trace payments, and print tax receipts</p>
        <div className="mobile-view-header-actions">
          <button className="btn btn-success" onClick={() => setIsPayOpen(true)} style={{ flex: 1 }}>
            <CreditCard size={16} /> Record Payment
          </button>
          <button className="btn btn-primary" onClick={onOpenInvoiceModal} style={{ flex: 1 }}>
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Mobile Bento Summary */}
      <div className="mobile-bento">
        <div className="mobile-bento-card full-width highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="mobile-bento-label" style={{ opacity: 0.8 }}>Total Receivables</div>
              <div className="mobile-bento-value large">₹{totalInvoiced.toLocaleString('en-IN')}</div>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', opacity: 0.9 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}></span>
              +12% from last month
            </span>
          </div>
        </div>
        <div className="mobile-bento-card" style={{ border: '1px solid rgba(220,38,38,0.2)' }}>
          <div className="mobile-bento-label" style={{ color: 'var(--danger)' }}>Overdue</div>
          <div className="mobile-bento-value" style={{ color: 'var(--danger)' }}>₹{pendingCollection.toLocaleString('en-IN')}</div>
        </div>
        <div className="mobile-bento-card">
          <div className="mobile-bento-label">Pending</div>
          <div className="mobile-bento-value">{invoices.filter(i => i.paymentStatus === 'Partially Paid' || i.paymentStatus === 'Unpaid').length} Invoices</div>
        </div>
      </div>

      {/* Mobile Search & Filter */}
      <div className="mobile-search-bar">
        <div className="mobile-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search invoices or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
        </div>
        <div className="mobile-filter-chips">
          <button className={`mobile-chip ${paymentFilter === 'all' ? 'active' : ''}`} onClick={() => setPaymentFilter('all')}>All</button>
          <button className={`mobile-chip ${paymentFilter === 'Paid' ? 'active' : ''}`} onClick={() => setPaymentFilter('Paid')}>Paid</button>
          <button className={`mobile-chip ${paymentFilter === 'Partially Paid' ? 'active' : ''}`} onClick={() => setPaymentFilter('Partially Paid')}>Pending</button>
          <button className={`mobile-chip ${paymentFilter === 'Unpaid' ? 'active' : ''}`} onClick={() => setPaymentFilter('Unpaid')}>Overdue</button>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-card-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingLeft: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Invoices
          </span>
        </div>
        {filteredInvoices.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <FileText size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No Invoices Found</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create your first sales invoice.</p>
          </div>
        ) : (
          filteredInvoices.map(inv => (
            <div key={inv.invoiceNo} className="mobile-card" onClick={() => setSelectedInvoice(inv)} style={{ cursor: 'pointer' }}>
              <div className="mobile-card-header">
                <div className="mobile-card-left">
                  <div className={`mobile-card-avatar ${inv.paymentStatus === 'Paid' ? 'success' : inv.paymentStatus === 'Partially Paid' ? 'warning' : 'danger'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="mobile-card-title">{inv.customerName}</div>
                    <div className="mobile-card-subtitle">{inv.invoiceNo} • {inv.date}</div>
                  </div>
                </div>
                <span className={`badge ${
                  inv.paymentStatus === 'Paid' ? 'badge-success' : 
                  inv.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                }`} style={{ fontSize: '0.65rem' }}>
                  {inv.paymentStatus}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">Total</span>
                  <span className="mobile-card-stat-value primary">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="mobile-card-stat" style={{ textAlign: 'right' }}>
                  <span className="mobile-card-stat-label">Collected</span>
                  <span className="mobile-card-stat-value success">₹{inv.amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View Header */}
      <div className="view-header">
        <div>
          <h2>Sales Invoices & Billing</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Record sales transactions, trace payments, and print tax receipts</p>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-success" onClick={() => setIsPayOpen(true)}>
            <CreditCard size={16} /> Record Payment
          </button>
          <button className="btn btn-primary" onClick={onOpenInvoiceModal}>
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Mini Stats Card */}
      <div className="kpi-grid responsive-grid-3" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Total Sales Invoiced</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0' }}>₹{totalInvoiced.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Collected Dues</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0', color: '#059669' }}>₹{totalCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Pending Payments</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0', color: pendingCollection > 0 ? '#dc2626' : 'inherit' }}>₹{pendingCollection.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Control Header */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search Invoice # or Customer name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="table-filters">
            <select 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="table-select"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Invoice Grid Table */}
        <table className="app-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Billing Date</th>
              <th style={{ textAlign: 'right' }}>Subtotal (₹)</th>
              <th style={{ textAlign: 'right' }}>GST Tax (₹)</th>
              <th style={{ textAlign: 'right' }}>Total (₹)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Collected (₹)</th>
              <th style={{ textAlign: 'center' }}>Mode</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <FileText size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Invoices found</p>
                  <p style={{ fontSize: '0.8rem' }}>Create your first sales invoice by clicking "Create Invoice" above.</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.invoiceNo}>
                  <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inv.invoiceNo}</td>
                  <td>{inv.customerName}</td>
                  <td>{inv.date}</td>
                  <td style={{ textAlign: 'right' }}>₹{inv.subtotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: '#475569' }}>₹{inv.taxAmount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{inv.grandTotal.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${
                      inv.paymentStatus === 'Paid' ? 'badge-success' : 
                      inv.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 500 }}>₹{inv.amountPaid.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{inv.paymentMode}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ padding: '4px 8px' }}
                      >
                        <Printer size={12} /> View/Print
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => { if (confirm(`Delete invoice ${inv.invoiceNo}? This will restore stock and adjust customer balance.`)) deleteInvoice(inv.invoiceNo); }}
                        style={{ padding: '4px 8px' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Customer Payment Modal */}
      {isPayOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Client Payment Received</h3>
              <button className="icon-btn" onClick={() => setIsPayOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handlePaySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Customer *</label>
                  <select 
                    value={payCustId} 
                    onChange={(e) => setPayCustId(e.target.value)} 
                    className="form-control"
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.filter(c => c.balance > 0).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Outstanding Dues: ₹{c.balance.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Received (₹) *</label>
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

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select 
                    value={payMode} 
                    onChange={(e) => setPayMode(e.target.value)} 
                    className="form-control"
                  >
                    <option value="UPI">UPI (Paytm/GPay/PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Net Banking / IMPS</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPayOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sales;
