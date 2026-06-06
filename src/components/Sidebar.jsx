import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Percent, 
  CreditCard, 
  UserCheck, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, isCollapsed, isMobileOpen, user, handleLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales & Invoices', icon: FileText },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'gst-settings', label: 'GST Settings', icon: Percent },
    { id: 'billing', label: 'Subscription', icon: CreditCard },
    { id: 'roles', label: 'User Roles', icon: UserCheck }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">AB</div>
        <span className="brand-name">ApnaBill SaaS</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-item-icon"><Icon size={20} /></span>
              <span className="nav-item-text">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user.loggedIn ? (
          <div className="user-profile-sm">
            <div className="user-avatar-sm">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="user-info-sm" style={{ flexGrow: 1 }}>
              <div className="user-name-sm">{user.name}</div>
              <div className="user-role-sm">Admin</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="icon-btn" 
              style={{ color: '#ef4444', padding: '6px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="nav-item" onClick={() => setActiveView('auth')}>
            <span className="nav-item-icon"><LogOut size={20} /></span>
            <span className="nav-item-text">Log In</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
