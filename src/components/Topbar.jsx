import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, AlertTriangle, Clock, CircleDollarSign } from 'lucide-react';

const Topbar = ({ 
  toggleSidebar, 
  notifications, 
  setActiveView, 
  settings, 
  globalSearchQuery, 
  setGlobalSearchQuery 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item) => {
    setShowNotifications(false);
    if (item.targetLink) {
      setActiveView(item.targetLink);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle size={16} />;
      case 'expiry':
        return <Clock size={16} />;
      case 'pending_payment':
        return <CircleDollarSign size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        
        <div className="business-selector">
          <span>Vyapora</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            (GSTIN: {settings.gstin || 'Unregistered'})
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Global Search Bar */}
        <div className="topbar-search">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search products, invoices, clients..." 
            className="search-input"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications Icon and Dropdown */}
        <div className="alert-badge-container" ref={dropdownRef}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="badge-count">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Business Alerts</h4>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                  {notifications.length} Action Items
                </span>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No alerts! Business is running smoothly.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className="notification-item"
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div className={`notification-icon-wrapper ${item.type}`}>
                        {getAlertIcon(item.type)}
                      </div>
                      <div className="notification-info">
                        <span className="notification-title">{item.title}</span>
                        <span className="notification-desc">{item.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '10px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <span 
                  onClick={() => { setShowNotifications(false); setActiveView('dashboard'); }} 
                  style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                >
                  View All in Dashboard
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
