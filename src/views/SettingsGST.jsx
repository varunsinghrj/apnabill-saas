import { useState } from 'react';
import { Percent, ShieldCheck } from 'lucide-react';

const SettingsGST = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState({
    businessName: settings.businessName || '',
    gstin: settings.gstin || '',
    gstType: settings.gstType || 'Regular',
    contactNo: settings.contactNo || '',
    email: settings.email || '',
    address: settings.address || '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setMessage('GST & Profile Settings updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="view-header">
        <div>
          <h2>GST & Business Profile</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Configure Indian taxation parameters, business filing schemes, and invoice headers</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #059669', color: '#059669', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h3 className="card-title" style={{ fontSize: '1.1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>GSTIN & Company Details</h3>
        
        <div className="form-group">
          <label className="form-label">Registered Business Name *</label>
          <input 
            type="text" 
            name="businessName" 
            value={formData.businessName} 
            onChange={handleChange} 
            className="form-control" 
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">GSTIN (GST Identification Number) *</label>
            <input 
              type="text" 
              name="gstin" 
              value={formData.gstin} 
              onChange={handleChange} 
              className="form-control" 
              maxLength="15"
              placeholder="e.g. 09AAAAA1111A1Z1"
              required
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tax Filing Scheme</label>
            <select name="gstType" value={formData.gstType} onChange={handleChange} className="form-control">
              <option value="Regular">Regular Tax Scheme (Standard GST splits & ITC)</option>
              <option value="Composition">Composition Scheme (1% Flat, no ITC, simplified)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Billing Contact Number *</label>
            <input 
              type="text" 
              name="contactNo" 
              value={formData.contactNo} 
              onChange={handleChange} 
              className="form-control" 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Billing Email Address *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="form-control" 
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Physical Shop / Warehouse Address *</label>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            className="form-control" 
            rows="3"
            required
            placeholder="Shop No, Street, Landmark, City, State, Pincode"
          />
        </div>

        {formData.gstType === 'Composition' && (
          <div style={{ display: 'flex', gap: '12px', background: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309', padding: '16px', borderRadius: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
              <strong>Composition Scheme Notice:</strong> Under the composition scheme, you cannot collect GST from your customers, nor can you claim Input Tax Credit (ITC) on purchases. Your invoices will automatically label as <em>"Composition taxable person, not eligible to collect tax on supplies"</em>.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary">Save Configuration</button>
        </div>
      </form>

      {/* Indian tax Slab Guideline box */}
      <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '10px' }}>
          <Percent size={18} style={{ color: '#2563eb' }} /> Default Active Indian GST Rates
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
          Standard HSN classification tax structures are supported out-of-the-box:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>0% - Essential Food grains, Milk, Salt</span>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>5% - Oils, Sugar, Tea, Atta</span>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>12% - Butter, Cheese, Snacks</span>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>18% - Soap, Detergents, Noodles</span>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>28% - Luxury goods, ACs</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsGST;
