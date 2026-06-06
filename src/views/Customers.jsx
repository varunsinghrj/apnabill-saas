import { useState } from 'react';
import { Search, Plus, UserCheck, Edit, Trash2 } from 'lucide-react';

const Customers = ({ customers, deleteCustomer, onOpenAddModal, onOpenEditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Customers Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Maintain client relationships, trace outstanding balances, and check billing details</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="table-container">
        <div className="table-header-controls">
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by name, phone, city..." 
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
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>GSTIN</th>
              <th>City</th>
              <th>State</th>
              <th style={{ textAlign: 'right' }}>Outstanding balance</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <UserCheck size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600 }}>No Customers Found</p>
                  <p style={{ fontSize: '0.8rem' }}>Create a client profile to track invoices and outstanding credits.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email || 'N/A'}</td>
                  <td>
                    {c.gstin ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{c.gstin}</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Consumer</span>
                    )}
                  </td>
                  <td>{c.city}</td>
                  <td>{c.state}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: c.balance > 0 ? '#dc2626' : c.balance < 0 ? '#059669' : '#0f172a' }}>
                    {c.balance > 0 ? `₹${c.balance.toLocaleString('en-IN')}` : c.balance < 0 ? `-₹${Math.abs(c.balance).toLocaleString('en-IN')}` : 'Settled (₹0)'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => onOpenEditModal(c)}
                        title="Edit Customer"
                        style={{ color: '#2563eb' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${c.name}?`)) {
                            deleteCustomer(c.id);
                          }
                        }}
                        title="Delete Customer"
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

export default Customers;
