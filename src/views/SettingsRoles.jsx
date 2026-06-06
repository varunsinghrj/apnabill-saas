import { useState } from 'react';
import { UserPlus, Shield, Trash2, X, AlertCircle } from 'lucide-react';

const SettingsRoles = ({ roles, addTeamMember, deleteTeamMember, toggleTeamMemberStatus, subscription }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Billing Operator');

  // Check if current plan allows inviting more operators
  const isLocked = roles.length >= (subscription.usersAllowed || 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    addTeamMember(name, email, role);
    setIsAddOpen(false);
    setName('');
    setEmail('');
    setRole('Billing Operator');
  };

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case 'Admin':
        return 'badge-danger';
      case 'Inventory Manager':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>User Roles & Permissions</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Invite staff, assign store permissions, and oversee operator logs</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsAddOpen(true)}
          disabled={isLocked}
        >
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      {isLocked && (
        <div style={{ display: 'flex', gap: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            <strong>Plan Seat Limit Reached:</strong> You have active operators ({roles.length}) matching or exceeding your plan's team seat limit ({subscription.usersAllowed || 0}). Please upgrade your subscription plan to invite more staff members.
          </div>
        </div>
      )}

      {/* Roles Details Card */}
      <div className="table-container" style={{ opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
        <div className="table-header-controls">
          <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Active Operators Registry</h4>
        </div>

        <table className="app-table">
          <thead>
            <tr>
              <th>Operator Name</th>
              <th>Email Address</th>
              <th>Role Assigned</th>
              <th style={{ textAlign: 'center' }}>Account Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${getRoleBadgeColor(u.role)}`}>{u.role}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => toggleTeamMemberStatus(u.id)}
                    className={`btn btn-sm ${u.active ? 'btn-success' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: '0.75rem', width: '80px' }}
                  >
                    {u.active ? 'Active' : 'Suspended'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="icon-btn" 
                    style={{ color: '#ef4444' }}
                    onClick={() => {
                      if (confirm(`Remove ${u.name} from business?`)) {
                        deleteTeamMember(u.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions Breakdown Matrix */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Role Permission Matrices</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '0.85rem' }}>
          
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '10px', color: '#dc2626' }}>
              <Shield size={16} /> Admin (Owner)
            </h4>
            <ul style={{ paddingLeft: '16px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Complete ledger controls</li>
              <li>GST setting adjustments</li>
              <li>Subscription billing payments</li>
              <li>User invite/revoking rights</li>
            </ul>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '10px', color: '#d97706' }}>
              <Shield size={16} /> Inventory Manager
            </h4>
            <ul style={{ paddingLeft: '16px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Add / Edit stock catalog</li>
              <li>Record batch & expiry details</li>
              <li>Record purchase PO sheets</li>
              <li style={{ textDecoration: 'line-through', opacity: 0.5 }}>Change business GST numbers</li>
            </ul>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '10px', color: '#2563eb' }}>
              <Shield size={16} /> Billing Operator
            </h4>
            <ul style={{ paddingLeft: '16px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Generate customer sales invoices</li>
              <li>Record payment collections</li>
              <li style={{ textDecoration: 'line-through', opacity: 0.5 }}>Delete invoices or transactions</li>
              <li style={{ textDecoration: 'line-through', opacity: 0.5 }}>Change wholesale cost metrics</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Invite Member Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invite New Operator</h3>
              <button className="icon-btn" onClick={() => setIsAddOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email ID *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="operator@company.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Assignment *</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="form-control"
                  >
                    <option value="Billing Operator">Billing Operator (Clerk)</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Admin">Co-Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsRoles;
