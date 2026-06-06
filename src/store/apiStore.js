import { useState, useEffect, useCallback } from 'react';

// Vite dev server proxies /api -> http://localhost:3001 (see vite.config.js)
// Netlify redirects /api -> https://apnabill-backend.onrender.com (see netlify.toml)
// This way the same `/api` base works in dev and production.
const API_BASE = '/api';

// ─── HTTP Helper ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('vyapora_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data;
}

// ─── Notification Generator (same logic as mockStore) ────────────────────────
function generateNotifications(products, invoices) {
  const alerts = [];
  const today = new Date();

  products.forEach(p => {
    if (p.stock <= p.minStock) {
      alerts.push({
        id: `alert-low-${p.id}`,
        type: 'low_stock',
        title: 'Low Stock Warning',
        message: `${p.name} has only ${p.stock} units left (Min: ${p.minStock})`,
        targetLink: 'inventory',
        item: p,
        severity: 'high'
      });
    }

    if (p.expiryDate) {
      const exp = new Date(p.expiryDate);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays >= 0) {
        alerts.push({
          id: `alert-exp-${p.id}`,
          type: 'expiry',
          title: 'Expiry Soon Alert',
          message: `${p.name} (Batch: ${p.batchNo}) expires in ${diffDays} days on ${p.expiryDate}`,
          targetLink: 'inventory',
          item: p,
          severity: diffDays <= 7 ? 'high' : 'medium'
        });
      } else if (diffDays < 0) {
        alerts.push({
          id: `alert-exp-past-${p.id}`,
          type: 'expiry',
          title: 'Product Expired',
          message: `${p.name} has expired on ${p.expiryDate}`,
          targetLink: 'inventory',
          item: p,
          severity: 'high'
        });
      }
    }
  });

  invoices.forEach(inv => {
    if (inv.paymentStatus !== 'Paid') {
      const due = inv.grandTotal - inv.amountPaid;
      alerts.push({
        id: `alert-pay-${inv.invoiceNo}`,
        type: 'pending_payment',
        title: 'Pending Invoice Dues',
        message: `Invoice ${inv.invoiceNo} for ${inv.customerName} has ₹${due.toLocaleString('en-IN')} pending`,
        targetLink: 'sales',
        item: inv,
        severity: due > 5000 ? 'high' : 'medium'
      });
    }
  });

  return alerts;
}

// ─── Main Store Hook ──────────────────────────────────────────────────────────
export const useApiStore = () => {
  // Auth state — load from localStorage on init
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vyapora_user');
      return stored ? JSON.parse(stored) : { loggedIn: false, name: '', email: '', businessName: '' };
    } catch { return { loggedIn: false, name: '', email: '', businessName: '' }; }
  });

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [settings, setSettingsState] = useState({ businessName: '', gstin: '', gstType: 'Regular', contactNo: '', email: '', address: '', currency: 'INR', financialYearStart: '' });
  const [subscription, setSubscription] = useState({ plan: 'Free Trial', status: 'Active', price: 0, expiryDate: '', trialEnds: '', usersAllowed: 1, featuresUnlocked: { advancedReports: false, multiWarehouse: false, aiAssistant: true, multiUser: false } });
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Persist user to localStorage
  useEffect(() => {
    localStorage.setItem('vyapora_user', JSON.stringify(user));
  }, [user]);

  // Generate notifications whenever products/invoices change
  useEffect(() => {
    setNotifications(generateNotifications(products, invoices));
  }, [products, invoices]);

  // ─── Load all data on login ─────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    if (!user.loggedIn) return;
    setLoading(true);
    setApiError(null);
    try {
      const [prods, custs, supps, invs, pos, sett, sub, rls] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/customers'),
        apiFetch('/suppliers'),
        apiFetch('/invoices'),
        apiFetch('/purchases'),
        apiFetch('/settings'),
        apiFetch('/settings/subscription'),
        apiFetch('/roles'),
      ]);
      setProducts(prods);
      setCustomers(custs);
      setSuppliers(supps);
      setInvoices(invs);
      setPurchases(pos);
      setSettingsState(sett);
      setSubscription(sub);
      setRoles(rls);
    } catch (err) {
      console.error('Failed to load data:', err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.loggedIn]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────
  const loginUser = async (email, password) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('vyapora_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (name, email, password, businessName) => {
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, businessName }) });
    localStorage.setItem('vyapora_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const onboardUser = async (settingsData) => {
    const data = await apiFetch('/auth/onboard', { method: 'POST', body: JSON.stringify(settingsData) });
    setSettingsState(data.settings);
    // Update user business name
    setUser(prev => ({ ...prev, businessName: settingsData.businessName || prev.businessName }));
    return data.settings;
  };

  const logoutUser = () => {
    localStorage.removeItem('vyapora_token');
    localStorage.removeItem('vyapora_user');
    setUser({ loggedIn: false, name: '', email: '', businessName: '' });
    setProducts([]); setCustomers([]); setSuppliers([]); setInvoices([]); setPurchases([]); setRoles([]);
    setSettingsState({ businessName: '', gstin: '', gstType: 'Regular', contactNo: '', email: '', address: '', currency: 'INR', financialYearStart: '' });
  };

  // ─── Product Actions ─────────────────────────────────────────────────────────
  const addProduct = async (prod) => {
    const newProd = await apiFetch('/products', { method: 'POST', body: JSON.stringify(prod) });
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = async (updatedProd) => {
    const updated = await apiFetch(`/products/${updatedProd.id}`, { method: 'PUT', body: JSON.stringify(updatedProd) });
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    return updated;
  };

  const deleteProduct = async (id) => {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ─── Customer Actions ────────────────────────────────────────────────────────
  const addCustomer = async (cust) => {
    const newCust = await apiFetch('/customers', { method: 'POST', body: JSON.stringify(cust) });
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = async (updatedCust) => {
    const updated = await apiFetch(`/customers/${updatedCust.id}`, { method: 'PUT', body: JSON.stringify(updatedCust) });
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    return updated;
  };

  const deleteCustomer = async (id) => {
    await apiFetch(`/customers/${id}`, { method: 'DELETE' });
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const recordCustomerPayment = async (customerId, amount, paymentMode) => {
    await apiFetch(`/customers/${customerId}/payment`, { method: 'POST', body: JSON.stringify({ amount, paymentMode }) });
    // Reload customers and invoices to get updated state
    const [custs, invs] = await Promise.all([apiFetch('/customers'), apiFetch('/invoices')]);
    setCustomers(custs);
    setInvoices(invs);
  };

  // ─── Supplier Actions ────────────────────────────────────────────────────────
  const addSupplier = async (supp) => {
    const newSupp = await apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(supp) });
    setSuppliers(prev => [newSupp, ...prev]);
    return newSupp;
  };

  const updateSupplier = async (updatedSupp) => {
    const updated = await apiFetch(`/suppliers/${updatedSupp.id}`, { method: 'PUT', body: JSON.stringify(updatedSupp) });
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
    return updated;
  };

  const deleteSupplier = async (id) => {
    await apiFetch(`/suppliers/${id}`, { method: 'DELETE' });
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const recordSupplierPayment = async (supplierId, amount) => {
    await apiFetch(`/suppliers/${supplierId}/payment`, { method: 'POST', body: JSON.stringify({ amount }) });
    const [supps, pos] = await Promise.all([apiFetch('/suppliers'), apiFetch('/purchases')]);
    setSuppliers(supps);
    setPurchases(pos);
  };

  // ─── Invoice Actions ─────────────────────────────────────────────────────────
  const addInvoice = async (invoiceData) => {
    const newInv = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(invoiceData) });
    setInvoices(prev => [newInv, ...prev]);
    // Refresh products and customers for updated stock/balance
    const [prods, custs] = await Promise.all([apiFetch('/products'), apiFetch('/customers')]);
    setProducts(prods);
    setCustomers(custs);
    return newInv;
  };

  // ─── Purchase Actions ─────────────────────────────────────────────────────────
  const addPurchaseOrder = async (poData) => {
    const newPO = await apiFetch('/purchases', { method: 'POST', body: JSON.stringify(poData) });
    setPurchases(prev => [newPO, ...prev]);
    // Refresh products and suppliers
    const [prods, supps] = await Promise.all([apiFetch('/products'), apiFetch('/suppliers')]);
    setProducts(prods);
    setSuppliers(supps);
    return newPO;
  };

  // ─── Settings Actions ─────────────────────────────────────────────────────────
  const setSettings = async (settingsData) => {
    const updated = await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(settingsData) });
    setSettingsState(updated);
    return updated;
  };

  const updateSubscriptionPlan = async (planName, priceValue, users) => {
    const updated = await apiFetch('/settings/subscription', { method: 'PUT', body: JSON.stringify({ plan: planName, price: priceValue, usersAllowed: users }) });
    setSubscription(updated);
    return updated;
  };

  // ─── Roles Actions ───────────────────────────────────────────────────────────
  const addTeamMember = async (name, email, role) => {
    const newMember = await apiFetch('/roles', { method: 'POST', body: JSON.stringify({ name, email, role }) });
    setRoles(prev => [...prev, newMember]);
    return newMember;
  };

  const deleteTeamMember = async (id) => {
    await apiFetch(`/roles/${id}`, { method: 'DELETE' });
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const toggleTeamMemberStatus = async (id) => {
    const updated = await apiFetch(`/roles/${id}/toggle`, { method: 'PATCH' });
    setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  // ─── Demo Data ────────────────────────────────────────────────────────────────
  const loadDemoData = async () => {
    await apiFetch('/auth/demo', { method: 'POST' });
    await loadAllData();
  };

  const clearAllData = () => {
    logoutUser();
  };

  return {
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
    loading,
    apiError,
    // Auth
    loginUser,
    registerUser,
    onboardUser,
    logoutUser,
    // Products
    addProduct,
    updateProduct,
    deleteProduct,
    // Customers
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    // Suppliers
    addSupplier,
    updateSupplier,
    deleteSupplier,
    recordSupplierPayment,
    // Invoices
    addInvoice,
    // Purchases
    addPurchaseOrder,
    // Settings
    setSettings,
    updateSubscriptionPlan,
    // Roles
    addTeamMember,
    deleteTeamMember,
    toggleTeamMemberStatus,
    // Utilities
    loadDemoData,
    clearAllData,
    refreshData: loadAllData,
  };
};
