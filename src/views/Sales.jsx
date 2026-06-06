import { useState } from 'react';
import { Search, Plus, Printer, FileText, ArrowLeft, CreditCard, X } from 'lucide-react';

const Sales = ({ 
  invoices, 
  customers, 
  recordCustomerPayment, 
  onOpenInvoiceModal,
  settings 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Payment Modal Trigger state
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payCustId, setPayCustId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');

  // Mini Dashboard Calculations
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

  const triggerPrint = () => {
    window.print();
  };

  // Detailed Invoice View
  if (selectedInvoice) {
    const isInterstate = selectedInvoice.customerId && 
      customers.find(c => c.id === selectedInvoice.customerId)?.state !== 'Uttar Pradesh';
      
    const matchingCustomer = customers.find(c => c.id === selectedInvoice.customerId);

    return (
      <div className="print-invoice-area">
        {/* Back Button (no-print) */}
        <div className="no-print invoice-actions">
          <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
            <ArrowLeft size={16} /> Back to Invoice History
          </button>
          <button className="btn btn-primary" onClick={triggerPrint}>
            <Printer size={16} /> Print/Save PDF
          </button>
        </div>

        {/* Invoice template */}
        <div className="invoice-template" style={{ padding: '40px' }}>
          {/* Header */}
          <div className="invoice-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{settings.businessName}</h2>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                {settings.address}<br />
                Phone: {settings.contactNo} | Email: {settings.email}<br />
                <strong>GSTIN:</strong> {settings.gstin}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>TAX INVOICE</span>
              <h3 style={{ fontSize: '1.25rem', marginTop: '12px', color: '#1e3a8a' }}>{selectedInvoice.invoiceNo}</h3>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Date: <strong>{selectedInvoice.date}</strong><br />
                Place of Supply: <strong>{matchingCustomer?.state || 'Uttar Pradesh'}</strong>
              </div>
            </div>
          </div>

          {/* Customer and Business Billing Info */}
          <div className="responsive-grid-2" style={{ marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Billed To:</span>
              <h4 style={{ fontSize: '1.05rem', margin: '4px 0 6px 0', color: '#0f172a' }}>{selectedInvoice.customerName}</h4>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                {matchingCustomer ? (
                  <>
                    State: {matchingCustomer.state}<br />
                    Phone: {matchingCustomer.phone}<br />
                    GSTIN: {matchingCustomer.gstin || 'Consumer (Unregistered)'}
                  </>
                ) : (
                  'Walk-in Retail Cash Client'
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div className="payment-summary" style={{ width: '260px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Total Invoice:</span>
                  <strong style={{ color: '#0f172a' }}>₹{selectedInvoice.grandTotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Amount Collected:</span>
                  <strong style={{ color: '#059669' }}>₹{selectedInvoice.amountPaid.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                  <span style={{ color: '#64748b' }}>Outstanding Dues:</span>
                  <strong style={{ color: '#dc2626' }}>₹{(selectedInvoice.grandTotal - selectedInvoice.amountPaid).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="invoice-items-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '32px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '60px' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Item Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', width: '100px' }}>Rate (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '80px' }}>Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '80px' }}>GST %</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', width: '120px' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.taxRate}%</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Invoice Summary and Tax Analysis */}
          <div className="invoice-summary-responsive responsive-grid-2" style={{ gap: '40px' }}>
            {/* Tax Details Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', height: 'fit-content' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#1e293b' }}>GST HSN Breakdown Summary</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#475569' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                    <th style={{ padding: '6px 0', textAlign: 'left' }}>Tax Rate</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Taxable Value</th>
                    {isInterstate ? (
                      <th style={{ padding: '6px 0', textAlign: 'right' }}>IGST</th>
                    ) : (
                      <>
                        <th style={{ padding: '6px 0', textAlign: 'right' }}>CGST</th>
                        <th style={{ padding: '6px 0', textAlign: 'right' }}>SGST</th>
                      </>
                    )}
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Categorize tax details */}
                  {Array.from(new Set(selectedInvoice.items.map(i => i.taxRate))).map(rate => {
                    const rateItems = selectedInvoice.items.filter(i => i.taxRate === rate);
                    const taxableVal = rateItems.reduce((acc, curr) => acc + curr.total, 0);
                    const taxAmt = (taxableVal * rate) / 100;
                    return (
                      <tr key={rate} style={{ borderBottom: '1px dotted #e2e8f0' }}>
                        <td style={{ padding: '6px 0' }}>{rate}% GST</td>
                        <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{taxableVal.toFixed(2)}</td>
                        {isInterstate ? (
                          <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{taxAmt.toFixed(2)}</td>
                        ) : (
                          <>
                            <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{(taxAmt / 2).toFixed(2)}</td>
                            <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{(taxAmt / 2).toFixed(2)}</td>
                          </>
                        )}
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{taxAmt.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 0', color: '#64748b' }}>Subtotal (Excl. Taxes)</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>₹{selectedInvoice.subtotal.toFixed(2)}</td>
                  </tr>
                  {selectedInvoice.discount > 0 && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', color: '#64748b' }}>Trade Discount</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#dc2626' }}>-₹{selectedInvoice.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 0', color: '#64748b' }}>Total GST Amount</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>₹{selectedInvoice.taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
                    <td style={{ padding: '16px 0 8px 0' }}>Grand Total (INR)</td>
                    <td style={{ padding: '16px 0 8px 0', textAlign: 'right' }}>₹{selectedInvoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="invoice-footer">
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Thank you for your business!<br />
              Generated electronically via <strong>Vyapora SaaS platform</strong>
            </div>
            <div className="signatory-box">
              <div className="signatory-line"></div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', fontWeight: 600 }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, list invoices
  return (
    <div>
      {/* View Header */}
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
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => setSelectedInvoice(inv)}
                      style={{ padding: '4px 8px' }}
                    >
                      <Printer size={12} /> View/Print
                    </button>
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
