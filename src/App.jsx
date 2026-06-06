import { useState } from 'react';
import { useApiStore } from './store/apiStore';

// Layout Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Modals
import ProductModal from './components/ProductModal';
import InvoiceModal from './components/InvoiceModal';
import PurchaseModal from './components/PurchaseModal';
import CustomerModal from './components/CustomerModal';
import SupplierModal from './components/SupplierModal';

// Views
import Dashboard from './views/Dashboard';
import Inventory from './views/Inventory';
import Sales from './views/Sales';
import Purchases from './views/Purchases';
import Customers from './views/Customers';
import Suppliers from './views/Suppliers';
import AIAssistant from './views/AIAssistant';
import Reports from './views/Reports';
import SettingsGST from './views/SettingsGST';
import SettingsBilling from './views/SettingsBilling';
import SettingsRoles from './views/SettingsRoles';
import Auth from './views/Auth';
import PaymentPaywall from './views/PaymentPaywall';

function App() {
  const store = useApiStore();
  const { 
    user, 
    products, 
    customers, 
    suppliers, 
    invoices, 
    purchases, 
    settings, 
    subscription, 
    roles, 
    notifications,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addInvoice,
    addPurchaseOrder,
    recordCustomerPayment,
    recordSupplierPayment,
    updateSubscriptionPlan,
    addTeamMember,
    deleteTeamMember,
    toggleTeamMemberStatus,
    setSettings,
    loginUser,
    registerUser,
    onboardUser,
    logoutUser
  } = store;

  // View routing state
  const [activeView, setActiveView] = useState('dashboard');
  
  // Layout collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global search input state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Modal open states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const toggleSidebar = () => {
    // On mobile, toggle the overlay. On desktop, toggle collapse
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setActiveView('auth');
  };

  // Trigger modals with editing payloads
  const triggerAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const triggerEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const triggerAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const triggerEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setIsCustomerModalOpen(true);
  };

  const triggerAddSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const triggerEditSupplier = (supp) => {
    setEditingSupplier(supp);
    setIsSupplierModalOpen(true);
  };

  // If search query is present, redirect to matching views
  const handleProductSubmit = (data) => {
    if (data.id) {
      updateProduct(data);
    } else {
      addProduct(data);
    }
  };

  const handleCustomerSubmit = (data) => {
    if (data.id) {
      updateCustomer(data);
    } else {
      addCustomer(data);
    }
  };

  const handleSupplierSubmit = (data) => {
    if (data.id) {
      updateSupplier(data);
    } else {
      addSupplier(data);
    }
  };

  // Render correct view panel
  const renderViewContent = () => {
    // If not logged in, force auth screen
    if (!user.loggedIn) {
      return (
        <Auth 
          loginUser={loginUser}
          registerUser={registerUser}
          onboardUser={onboardUser}
          setActiveView={setActiveView} 
          setSettings={setSettings}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            products={products}
            customers={customers}
            suppliers={suppliers}
            invoices={invoices}
            notifications={notifications}
            setActiveView={setActiveView}
            openInvoiceModal={() => setIsInvoiceModalOpen(true)}
            openPurchaseModal={() => setIsPurchaseModalOpen(true)}
            openProductModal={triggerAddProduct}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            onOpenAddModal={triggerAddProduct}
            onOpenEditModal={triggerEditProduct}
          />
        );
      case 'sales':
        return (
          <Sales 
            invoices={invoices}
            customers={customers}
            addInvoice={addInvoice}
            recordCustomerPayment={recordCustomerPayment}
            onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
            settings={settings}
          />
        );
      case 'purchases':
        return (
          <Purchases 
            purchases={purchases}
            suppliers={suppliers}
            onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
            recordSupplierPayment={recordSupplierPayment}
          />
        );
      case 'customers':
        return (
          <Customers 
            customers={customers}
            addCustomer={addCustomer}
            updateCustomer={updateCustomer}
            deleteCustomer={deleteCustomer}
            onOpenAddModal={triggerAddCustomer}
            onOpenEditModal={triggerEditCustomer}
          />
        );
      case 'suppliers':
        return (
          <Suppliers 
            suppliers={suppliers}
            addSupplier={addSupplier}
            updateSupplier={updateSupplier}
            deleteSupplier={deleteSupplier}
            onOpenAddModal={triggerAddSupplier}
            onOpenEditModal={triggerEditSupplier}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistant 
            products={products}
            customers={customers}
            suppliers={suppliers}
            invoices={invoices}
            notifications={notifications}
            openPurchaseModal={() => setIsPurchaseModalOpen(true)}
          />
        );
      case 'reports':
        return (
          <Reports 
            products={products}
            invoices={invoices}
            purchases={purchases}
            settings={settings}
          />
        );
      case 'gst-settings':
        return (
          <SettingsGST 
            settings={settings}
            setSettings={setSettings}
          />
        );
      case 'billing':
        return (
          <SettingsBilling 
            subscription={subscription}
            updateSubscriptionPlan={updateSubscriptionPlan}
          />
        );
      case 'roles':
        return (
          <SettingsRoles 
            roles={roles}
            addTeamMember={addTeamMember}
            deleteTeamMember={deleteTeamMember}
            toggleTeamMemberStatus={toggleTeamMemberStatus}
            subscription={subscription}
          />
        );
      default:
        return <Dashboard products={products} customers={customers} invoices={invoices} notifications={notifications} setActiveView={setActiveView} />;
    }
  };

  // Global Auth View wrapper (so sidebar/topbar doesn't display on login)
  if (!user.loggedIn) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Auth 
          loginUser={loginUser}
          registerUser={registerUser}
          onboardUser={onboardUser}
          setActiveView={setActiveView} 
          setSettings={setSettings}
        />
      </div>
    );
  }

  // Global Subscription Paywall wrapper (blocks access if unpaid)
  if (subscription.status !== 'Active' || subscription.plan === 'None') {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 20px', background: '#f8fafc' }}>
        <PaymentPaywall 
          subscription={subscription}
          updateSubscriptionPlan={updateSubscriptionPlan}
          logoutUser={logoutUser}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 99
          }}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileSidebarOpen(false); // Close drawer on link click
        }}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Panel Content */}
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
        
        {/* Top Header Controls */}
        <Topbar 
          toggleSidebar={toggleSidebar} 
          notifications={notifications}
          setActiveView={setActiveView}
          settings={settings}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={(val) => {
            setGlobalSearchQuery(val);
            // If they search, automatically route to inventory so they see filtered rows
            if (val && activeView !== 'inventory' && activeView !== 'sales') {
              setActiveView('inventory');
            }
          }}
        />

        {/* Dynamic Inner Panel */}
        <div className="view-container">
          {renderViewContent()}
        </div>
      </main>

      {/* Dynamic Popups Modal Layer */}
      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        product={editingProduct}
      />

      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={addInvoice}
        products={products}
        customers={customers}
        settings={settings}
      />

      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSubmit={addPurchaseOrder}
        products={products}
        suppliers={suppliers}
      />

      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleCustomerSubmit}
        customer={editingCustomer}
      />

      <SupplierModal 
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleSupplierSubmit}
        supplier={editingSupplier}
      />
    </div>
  );
}

export default App;
