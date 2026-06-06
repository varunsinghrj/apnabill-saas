import { useState, useEffect } from 'react';
import { X, Trash2, Plus, QrCode } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, onSubmit, products, customers }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  // Items being added to current invoice
  const [invoiceItems, setInvoiceItems] = useState([]);
  
  // Current item selectors
  const [currentItemId, setCurrentItemId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedCustomerId('');
      setDiscount(0);
      setAmountPaid('');
      setPaymentStatus('Unpaid');
      setPaymentMode('Cash');
      setInvoiceItems([]);
      setCurrentItemId('');
      setCurrentQty(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected customer details
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Add item to invoice list
  const handleAddItem = () => {
    if (!currentItemId) return;
    const prod = products.find(p => p.id === currentItemId);
    if (!prod) return;

    // Check if item already exists in invoice
    const existingIndex = invoiceItems.findIndex(item => item.productId === currentItemId);
    
    if (existingIndex > -1) {
      const updated = [...invoiceItems];
      const newQty = updated[existingIndex].qty + Number(currentQty);
      if (newQty > prod.stock) {
        alert(`Warning: Requested quantity (${newQty}) exceeds available stock (${prod.stock})!`);
      }
      updated[existingIndex].qty = newQty;
      updated[existingIndex].total = newQty * prod.sellingPrice;
      setInvoiceItems(updated);
    } else {
      if (Number(currentQty) > prod.stock) {
        alert(`Warning: Requested quantity (${currentQty}) exceeds available stock (${prod.stock})!`);
      }
      const newItem = {
        productId: prod.id,
        name: prod.name,
        qty: Number(currentQty),
        price: prod.sellingPrice,
        taxRate: prod.taxRate,
        total: Number(currentQty) * prod.sellingPrice
      };
      setInvoiceItems(prev => [...prev, newItem]);
    }

    // Reset item selectors
    setCurrentItemId('');
    setCurrentQty(1);
  };

  // Remove item from invoice
  const handleRemoveItem = (index) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  // Math Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    invoiceItems.forEach(item => {
      subtotal += item.total;
      // GST calculation: item total represents the pre-tax or post-tax? 
      // Usually selling price is taxable value. GST is calculated on top, or included.
      // Let's assume selling price is pre-tax and GST is added on top.
      const itemTax = (item.total * item.taxRate) / 100;
      taxAmount += itemTax;
    });

    const subtotalAfterDiscount = Math.max(0, subtotal - Number(discount));
    const grandTotal = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      taxAmount,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  };

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

  // Auto-adjust payment status/amounts
  const handleGrandTotalClick = () => {
    setAmountPaid(grandTotal);
    setPaymentStatus('Paid');
  };

  const handleAmountPaidChange = (e) => {
    const val = e.target.value;
    setAmountPaid(val);
    const numVal = Number(val);

    if (numVal >= grandTotal) {
      setPaymentStatus('Paid');
    } else if (numVal > 0) {
      setPaymentStatus('Partially Paid');
    } else {
      setPaymentStatus('Unpaid');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      alert('Please add at least one item to the invoice.');
      return;
    }

    const customerName = selectedCustomerId 
      ? (selectedCustomer?.name || 'Walk-in Customer')
      : 'Cash Customer';

    const invoiceData = {
      customerId: selectedCustomerId || null,
      customerName,
      items: invoiceItems,
      subtotal,
      taxAmount,
      discount: Number(discount),
      grandTotal,
      paymentStatus,
      amountPaid: Number(amountPaid || 0),
      paymentMode: paymentStatus === 'Unpaid' ? 'N/A' : paymentMode
    };

    onSubmit(invoiceData);
    onClose();
  };

  // Determine GST Split: CGST/SGST vs IGST
  // If customer is in Uttar Pradesh (same as business setting), split is CGST (half) & SGST (half)
  // Else (or if state is empty/unregistered), assume CGST/SGST for simplicity or IGST
  const isInterstate = selectedCustomer && selectedCustomer.state !== 'Uttar Pradesh';

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Create Sales Invoice</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            
            {/* Customer Lookup */}
            <div className="form-row">
              <div className="form-group" style={{ flexGrow: 2 }}>
                <label className="form-label">Select Customer / Client</label>
                <select 
                  value={selectedCustomerId} 
                  onChange={(e) => setSelectedCustomerId(e.target.value)} 
                  className="form-control"
                >
                  <option value="">-- Cash Customer (Walk-in) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} - Bal: ₹{c.balance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="form-group" style={{ minWidth: '220px' }}>
                  <label className="form-label">GSTIN & Address</label>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>GSTIN:</strong> {selectedCustomer.gstin || 'None (Consumer)'}<br />
                    <strong>State:</strong> {selectedCustomer.state || 'N/A'} ({isInterstate ? 'IGST Interstate' : 'CGST+SGST Local'})
                  </div>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

            {/* Invoice Line Items Editor */}
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Add Products to Invoice</h4>
            <div className="form-row" style={{ gridTemplateColumns: '3fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Choose Product</label>
                <select 
                  value={currentItemId} 
                  onChange={(e) => setCurrentItemId(e.target.value)} 
                  className="form-control"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} (Stock: {p.stock}) - Price: ₹{p.sellingPrice} [+ {p.taxRate}% GST]
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Qty</label>
                <input 
                  type="number" 
                  value={currentQty} 
                  onChange={(e) => setCurrentQty(Math.max(1, Number(e.target.value)))}
                  className="form-control" 
                  min="1"
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={!currentItemId}
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>
            </div>

            {/* Selected Items Grid */}
            <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>SNo</th>
                    <th>Product</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Price (₹)</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>GST (%)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Subtotal (₹)</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No items added to invoice yet. Select a product above to add.
                      </td>
                    </tr>
                  ) : (
                    invoiceItems.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{item.name}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-secondary">{item.taxRate}%</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            className="icon-btn" 
                            style={{ color: '#ef4444' }}
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Payments Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '24px' }}>
              
              {/* Payment details */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#334155' }}>Payment Details</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)} 
                      className="form-control"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  {paymentStatus !== 'Unpaid' && (
                    <div className="form-group">
                      <label className="form-label">Payment Mode</label>
                      <select 
                        value={paymentMode} 
                        onChange={(e) => setPaymentMode(e.target.value)} 
                        className="form-control"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      value={amountPaid} 
                      onChange={handleAmountPaidChange}
                      className="form-control"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={paymentStatus === 'Unpaid'}
                    />
                  </div>
                  
                  {paymentStatus !== 'Paid' && grandTotal > 0 && (
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <span 
                        onClick={handleGrandTotalClick} 
                        style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', marginBottom: '12px' }}
                      >
                        Mark Full Paid (₹{grandTotal})
                      </span>
                    </div>
                  )}
                </div>

                {/* Show Mock UPI QR Code for shop billing */}
                {paymentStatus === 'Paid' && paymentMode === 'UPI' && grandTotal > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                    <div style={{ background: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={64} style={{ color: '#1e3a8a' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>
                      <strong>Business UPI QR Code Active</strong><br />
                      Let customer scan to pay ₹{grandTotal.toLocaleString('en-IN')}<br />
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>upi://pay?pa=apnabazaar@okaxis&am={grandTotal}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Calculations */}
              <div>
                <div className="invoice-summary-box">
                  <table className="invoice-summary-table">
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b' }}>Subtotal (Excl. Tax)</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>Discount (₹)</td>
                        <td style={{ textAlign: 'right' }}>
                          <input 
                            type="number" 
                            value={discount} 
                            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                            className="form-control" 
                            style={{ width: '100px', padding: '4px 8px', fontSize: '0.85rem', display: 'inline-block', textAlign: 'right' }}
                            min="0"
                          />
                        </td>
                      </tr>
                      {/* GST Split calculation */}
                      {isInterstate ? (
                        <tr>
                          <td style={{ color: '#64748b' }}>IGST (Interstate Tax)</td>
                          <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{taxAmount.toFixed(2)}</td>
                        </tr>
                      ) : (
                        <>
                          <tr>
                            <td style={{ color: '#64748b' }}>CGST (Central Tax - {(taxAmount > 0) ? 'Half' : '0%'})</td>
                            <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{(taxAmount / 2).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b' }}>SGST (State Tax - {(taxAmount > 0) ? 'Half' : '0%'})</td>
                            <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{(taxAmount / 2).toFixed(2)}</td>
                          </tr>
                        </>
                      )}
                      <tr className="total-row">
                        <td>Grand Total (Incl. GST)</td>
                        <td style={{ textAlign: 'right' }}>₹{grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Discard</button>
            <button type="submit" className="btn btn-success">
              Generate & Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
