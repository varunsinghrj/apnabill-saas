import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, onSubmit, customer = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    city: '',
    state: 'Uttar Pradesh',
    balance: '0'
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        gstin: customer.gstin || '',
        city: customer.city || '',
        state: customer.state || 'Uttar Pradesh',
        balance: String(customer.balance || 0)
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        gstin: '',
        city: '',
        state: 'Uttar Pradesh',
        balance: '0'
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      balance: Number(formData.balance)
    });
    onClose();
  };

  // Indian States list for GST placement
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Puducherry', 'Chandigarh', 'Daman and Diu', 'Dadra and Nagar Haveli', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{customer ? 'Edit Customer Info' : 'Add New Customer'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer / Business Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="e.g. Gupta Kirana Store"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                  maxLength="10"
                  placeholder="10 digit mobile"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="e.g. contact@store.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN (Optional)</label>
              <input 
                type="text" 
                name="gstin" 
                value={formData.gstin} 
                onChange={handleChange} 
                className="form-control" 
                maxLength="15"
                placeholder="15-digit GSTIN"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="e.g. Noida"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State (for GST tax calculations)</label>
                <select name="state" value={formData.state} onChange={handleChange} className="form-control">
                  {states.sort().map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Opening Ledger Balance (₹)</label>
              <div className="input-addon-group">
                <span className="input-addon-left">₹</span>
                <input 
                  type="number" 
                  name="balance" 
                  value={formData.balance} 
                  onChange={handleChange} 
                  className="form-control input-with-addon-left" 
                  placeholder="0.00"
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                * Use positive numbers if the customer owes you money. Use negative if you owe them.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{customer ? 'Save Changes' : 'Save Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
