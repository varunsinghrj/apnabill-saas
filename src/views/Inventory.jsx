import { useState } from 'react';
import { Search, AlertTriangle, PackagePlus, Edit, Trash2 } from 'lucide-react';

const Inventory = ({ products, deleteProduct, onOpenAddModal, onOpenEditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [stockStatus, setStockStatus] = useState('all');

  // Math Calculations for Mini Dashboard
  const totalSKUs = products.length;
  const totalStockQty = products.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  
  const today = new Date();
  const expiringCount = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  // Filter products based on search and filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesWarehouse = selectedWarehouse ? p.warehouse === selectedWarehouse : true;

    let matchesStatus = true;
    if (stockStatus === 'low') {
      matchesStatus = p.stock <= p.minStock && p.stock > 0;
    } else if (stockStatus === 'out') {
      matchesStatus = p.stock === 0;
    } else if (stockStatus === 'expiring') {
      if (!p.expiryDate) {
        matchesStatus = false;
      } else {
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        matchesStatus = diffDays <= 30;
      }
    }

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) {
      return <span className="badge badge-danger">Out of Stock (0)</span>;
    }
    if (stock <= minStock) {
      return <span className="badge badge-warning">Low Stock ({stock})</span>;
    }
    return <span className="badge badge-success">In Stock ({stock})</span>;
  };

  const categories = [...new Set(products.map(p => p.category))];
  const warehouses = [...new Set(products.map(p => p.warehouse))];

  return (
    <div>
      {/* View Header */}
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Inventory Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage products, batch details, and warehouse stocks</p>
        </div>
        <div className="view-header-actions">
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <PackagePlus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="kpi-grid responsive-grid-4" style={{ marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Total unique items</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0' }}>{totalSKUs} SKUs</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Total Stock Qty</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0' }}>{totalStockQty.toLocaleString('en-IN')} units</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Low Stock Items</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0', color: lowStockCount > 0 ? '#d97706' : 'inherit' }}>{lowStockCount} items</span>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <div className="kpi-left">
            <span className="kpi-title" style={{ fontSize: '0.75rem' }}>Expiring Items (30d)</span>
            <span className="kpi-value" style={{ fontSize: '1.4rem', margin: '4px 0', color: expiringCount > 0 ? '#dc2626' : 'inherit' }}>{expiringCount} items</span>
          </div>
        </div>
      </div>

      {/* Product Table Control Headers */}
      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, SKU, HSN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="table-filters">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="table-select"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select 
              value={selectedWarehouse} 
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="table-select"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select 
              value={stockStatus} 
              onChange={(e) => setStockStatus(e.target.value)}
              className="table-select"
            >
              <option value="all">All Stocks</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <table className="app-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU / HSN</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Cost Price</th>
              <th style={{ textAlign: 'right' }}>Selling Price</th>
              <th style={{ textAlign: 'center' }}>GST Rate</th>
              <th style={{ textAlign: 'center' }}>Stock status</th>
              <th>Batch / Expiry</th>
              <th>Warehouse</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <AlertTriangle size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No products matched filters</p>
                  <p style={{ fontSize: '0.8rem' }}>Try refining your search terms or adding a new product.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>SKU: {p.sku || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HSN: {p.hsn}</div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{p.costPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>₹{p.sellingPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-secondary">{p.taxRate}%</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {getStockBadge(p.stock, p.minStock)}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{p.batchNo || 'N/A'}</div>
                    {p.expiryDate && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: new Date(p.expiryDate) <= today ? '#dc2626' : 
                               Math.ceil((new Date(p.expiryDate) - today) / (1000 * 60 * 60 * 24)) <= 30 ? '#d97706' : '#64748b',
                        fontWeight: 500
                      }}>
                        Exp: {p.expiryDate}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{p.warehouse}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => onOpenEditModal(p)}
                        title="Edit Product"
                        style={{ color: '#2563eb' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => {
                          if(confirm(`Are you sure you want to delete ${p.name}?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        title="Delete Product"
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

export default Inventory;
