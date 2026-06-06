import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SupplierModal = ({ isOpen, onClose, onSubmit, supplier = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    dues: '0'
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        id: supplier.id,
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        gstin: supplier.gstin || '',
        dues: String(supplier.dues || 0)
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        gstin: '',
        dues: '0'
      });
    }
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dues: Number(formData.dues)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{supplier ? 'Edit Supplier Info' : 'Add New Supplier'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Supplier / Vendor Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="e.g. HUL Distributor Delhi"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person Name</label>
              <input 
                type="text" 
                name="contactPerson" 
                value={formData.contactPerson} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="e.g. Vikram Singh"
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
                  placeholder="e.g. billing@supplier.com"
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

            <div className="form-group">
              <label className="form-label">Opening Dues Balance (₹)</label>
              <div className="input-addon-group">
                <span className="input-addon-left">₹</span>
                <input 
                  type="number" 
                  name="dues" 
                  value={formData.dues} 
                  onChange={handleChange} 
                  className="form-control input-with-addon-left" 
                  placeholder="0.00"
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                * How much money you currently owe to this supplier for prior orders.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{supplier ? 'Save Changes' : 'Save Supplier'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
