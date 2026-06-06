import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

const PurchaseModal = ({ isOpen, onClose, onSubmit, products, suppliers }) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  
  // Items being added to purchase order
  const [poItems, setPoItems] = useState([]);
  
  // Current item selectors
  const [currentItemId, setCurrentItemId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedSupplierId('');
      setAmountPaid('');
      setPaymentStatus('Pending');
      setPoItems([]);
      setCurrentItemId('');
      setCurrentQty(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleAddItem = () => {
    if (!currentItemId) return;
    const prod = products.find(p => p.id === currentItemId);
    if (!prod) return;

    const existingIndex = poItems.findIndex(item => item.productId === currentItemId);
    
    if (existingIndex > -1) {
      const updated = [...poItems];
      const newQty = updated[existingIndex].qty + Number(currentQty);
      updated[existingIndex].qty = newQty;
      updated[existingIndex].total = newQty * prod.costPrice;
      setPoItems(updated);
    } else {
      const newItem = {
        productId: prod.id,
        name: prod.name,
        qty: Number(currentQty),
        price: prod.costPrice, // buying at cost price
        taxRate: prod.taxRate,
        total: Number(currentQty) * prod.costPrice
      };
      setPoItems(prev => [...prev, newItem]);
    }

    setCurrentItemId('');
    setCurrentQty(1);
  };

  const handleRemoveItem = (index) => {
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    poItems.forEach(item => {
      subtotal += item.total;
      const itemTax = (item.total * item.taxRate) / 100;
      taxAmount += itemTax;
    });

    const grandTotal = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  };

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

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
    } else {
      setPaymentStatus('Pending');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('Please select a supplier.');
      return;
    }
    if (poItems.length === 0) {
      alert('Please add at least one item to purchase.');
      return;
    }

    const poData = {
      supplierId: selectedSupplierId,
      supplierName: selectedSupplier?.name || 'Unknown Supplier',
      items: poItems,
      subtotal,
      taxAmount,
      grandTotal,
      paymentStatus,
      amountPaid: Number(amountPaid || 0)
    };

    onSubmit(poData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Record Purchase Order (Stock In)</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            
            {/* Supplier Lookup */}
            <div className="form-group">
              <label className="form-label">Select Wholesaler / Supplier *</label>
              <select 
                value={selectedSupplierId} 
                onChange={(e) => setSelectedSupplierId(e.target.value)} 
                className="form-control"
                required
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Contact: {s.contactPerson}) - Outstanding: ₹{s.dues.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

            {/* Products Selector */}
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Order Line Items</h4>
            <div className="form-row" style={{ gridTemplateColumns: '3fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select 
                  value={currentItemId} 
                  onChange={(e) => setCurrentItemId(e.target.value)} 
                  className="form-control"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock}) - Cost: ₹{p.costPrice} [+ {p.taxRate}% GST]
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Qty</label>
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
                    <th style={{ width: '100px', textAlign: 'right' }}>Cost Price (₹)</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>GST (%)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Subtotal (₹)</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No items added to purchase order yet. Select a product above to add.
                      </td>
                    </tr>
                  ) : (
                    poItems.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
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

            {/* Calculations Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginTop: '24px' }}>
              
              {/* Payment Details */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#334155' }}>Payment & Ledger Options</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)} 
                      className="form-control"
                    >
                      <option value="Paid">Paid (Full)</option>
                      <option value="Pending">Pending (Credit Ledger)</option>
                    </select>
                  </div>
                  
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
                    />
                  </div>
                </div>

                {paymentStatus === 'Pending' && grandTotal > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '10px', borderRadius: '8px', marginTop: '12px' }}>
                    <strong>Credit Purchase Action</strong><br />
                    Outstanding dues of ₹{(grandTotal - Number(amountPaid || 0)).toLocaleString('en-IN')} will be added to {selectedSupplier?.name || 'Supplier'}'s ledger account.
                  </div>
                )}
                
                {paymentStatus !== 'Paid' && grandTotal > 0 && (
                  <span 
                    onClick={handleGrandTotalClick} 
                    style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}
                  >
                    Set Full Paid (₹{grandTotal})
                  </span>
                )}
              </div>

              {/* Calculations Box */}
              <div>
                <div className="invoice-summary-box">
                  <table className="invoice-summary-table">
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b' }}>Subtotal (Goods Value)</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>GST Input Tax Credit (ITC)</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="total-row">
                        <td>Grand Total (Incl. Taxes)</td>
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
            <button type="submit" className="btn btn-primary">Receive & Save Purchase</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
