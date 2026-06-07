import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Settings 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'sales', label: 'Billing', icon: FileText },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MobileNav = ({ activeView, setActiveView }) => {
  const getView = (id) => {
    if (id === 'settings') {
      if (activeView === 'gst-settings' || activeView === 'billing' || activeView === 'roles') return 'settings';
      return null;
    }
    return id;
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const currentView = getView(item.id);
        const isActive = item.id === 'settings'
          ? ['gst-settings', 'billing', 'roles', 'settings'].includes(activeView)
          : activeView === item.id;

        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveView(item.id === 'settings' ? 'gst-settings' : item.id)}
          >
            <span className="mobile-nav-icon">
              <Icon size={22} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
