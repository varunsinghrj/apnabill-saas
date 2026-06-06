import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    hsn: '',
    category: 'Grocery',
    costPrice: '',
    sellingPrice: '',
    taxRate: '18',
    stock: '',
    minStock: '10',
    batchNo: '',
    expiryDate: '',
    warehouse: 'Warehouse Noida-A'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        sku: product.sku || '',
        hsn: product.hsn || '',
        category: product.category || 'Grocery',
        costPrice: product.costPrice || '',
        sellingPrice: product.sellingPrice || '',
        taxRate: String(product.taxRate ?? 18),
        stock: product.stock || '0',
        minStock: product.minStock || '10',
        batchNo: product.batchNo || '',
        expiryDate: product.expiryDate || '',
        warehouse: product.warehouse || 'Warehouse Noida-A'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        hsn: '',
        category: 'Grocery',
        costPrice: '',
        sellingPrice: '',
        taxRate: '18',
        stock: '',
        minStock: '10',
        batchNo: `B-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: '',
        warehouse: 'Warehouse Noida-A'
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      taxRate: Number(formData.taxRate)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? 'Edit Product Details' : 'Add New Product'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="e.g. Aashirvaad Shudh Chakki Atta (5kg)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU Code</label>
                <input 
                  type="text" 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="e.g. ATT-AASH-05"
                />
              </div>
              <div className="form-group">
                <label className="form-label">HSN Code *</label>
                <input 
                  type="text" 
                  name="hsn" 
                  value={formData.hsn} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                  placeholder="8 digit HSN code"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                  <option value="Grocery">Grocery</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Household">Household</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">GST Rate (%)</label>
                <select name="taxRate" value={formData.taxRate} onChange={handleChange} className="form-control">
                  <option value="0">0% (Nil Rated)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cost Price (₹) *</label>
                <div className="input-addon-group">
                  <span className="input-addon-left">₹</span>
                  <input 
                    type="number" 
                    name="costPrice" 
                    value={formData.costPrice} 
                    onChange={handleChange} 
                    className="form-control input-with-addon-left" 
                    required 
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <div className="input-addon-group">
                  <span className="input-addon-left">₹</span>
                  <input 
                    type="number" 
                    name="sellingPrice" 
                    value={formData.sellingPrice} 
                    onChange={handleChange} 
                    className="form-control input-with-addon-left" 
                    required 
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Stock Qty *</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Min Stock Level (Alert)</label>
                <input 
                  type="number" 
                  name="minStock" 
                  value={formData.minStock} 
                  onChange={handleChange} 
                  className="form-control" 
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Batch No.</label>
                <input 
                  type="text" 
                  name="batchNo" 
                  value={formData.batchNo} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="e.g. B-ATT-889"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input 
                  type="date" 
                  name="expiryDate" 
                  value={formData.expiryDate} 
                  onChange={handleChange} 
                  className="form-control" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <select name="warehouse" value={formData.warehouse} onChange={handleChange} className="form-control">
                <option value="Warehouse Noida-A">Warehouse Noida-A</option>
                <option value="Warehouse Noida-B">Warehouse Noida-B</option>
                <option value="Cold Storage Noida">Cold Storage Noida</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{product ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
