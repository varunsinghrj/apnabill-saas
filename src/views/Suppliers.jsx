import { useState } from 'react';
import { Search, Plus, Truck, Edit, Trash2 } from 'lucide-react';

const Suppliers = ({ suppliers, deleteSupplier, onOpenAddModal, onOpenEditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  return (
    <div>
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Suppliers Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage wholesale suppliers, trace purchases, and monitor outstanding payables</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="table-container">
        <div className="table-header-controls">
          <div className="table-search-input" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, contact, phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <table className="app-table">
          <thead>
            <tr>
              <th>Supplier / Business Name</th>
              <th>Contact Person</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>GSTIN</th>
              <th style={{ textAlign: 'right' }}>Outstanding Payables</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <Truck size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Suppliers Found</p>
                  <p style={{ fontSize: '0.8rem' }}>Add a supplier to record purchase stock replenishments on credit.</p>
                </td>
              </tr>
            ) : (
              filteredSuppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                  </td>
                  <td>{s.contactPerson || 'N/A'}</td>
                  <td>{s.phone}</td>
                  <td>{s.email || 'N/A'}</td>
                  <td>
                    {s.gstin ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{s.gstin}</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unregistered</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: s.dues > 0 ? '#dc2626' : '#0f172a' }}>
                    {s.dues > 0 ? `₹${s.dues.toLocaleString('en-IN')}` : 'Paid (₹0)'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => onOpenEditModal(s)}
                        title="Edit Supplier"
                        style={{ color: '#2563eb' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                            deleteSupplier(s.id);
                          }
                        }}
                        title="Delete Supplier"
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

export default Suppliers;
