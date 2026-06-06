import { useState, useEffect } from 'react';

// Demo Data (stored under DEMO_... prefixes so the app can be optionally seeded)
const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', sku: 'ATT-AASH-05', hsn: '11010000', category: 'Grocery', costPrice: 210, sellingPrice: 260, taxRate: 5, stock: 45, minStock: 15, batchNo: 'B-ATT-889', expiryDate: '2026-11-20', warehouse: 'Warehouse Noida-A' },
  { id: 'p2', name: 'Surf Excel Easy Wash (1kg)', sku: 'DET-SURF-01', hsn: '34029099', category: 'Household', costPrice: 130, sellingPrice: 170, taxRate: 18, stock: 12, minStock: 20, batchNo: 'B-SURF-122', expiryDate: '2028-05-15', warehouse: 'Warehouse Noida-B' },
  { id: 'p3', name: 'Tata Salt (1kg)', sku: 'SLT-TATA-01', hsn: '25010000', category: 'Grocery', costPrice: 22, sellingPrice: 28, taxRate: 0, stock: 110, minStock: 30, batchNo: 'B-TATA-554', expiryDate: '2027-12-10', warehouse: 'Warehouse Noida-A' },
  { id: 'p4', name: 'Amul Butter (500g)', sku: 'BUT-AMUL-500', hsn: '04051000', category: 'Dairy', costPrice: 215, sellingPrice: 265, taxRate: 12, stock: 8, minStock: 10, batchNo: 'B-AMUL-012', expiryDate: '2026-07-02', warehouse: 'Cold Storage Noida' },
  { id: 'p5', name: 'Maggi 2-Min Masala Noodles (12-Pk)', sku: 'NDL-MAGG-12', hsn: '19023010', category: 'Grocery', costPrice: 140, sellingPrice: 180, taxRate: 18, stock: 65, minStock: 25, batchNo: 'B-MAGG-404', expiryDate: '2026-12-25', warehouse: 'Warehouse Noida-B' },
  { id: 'p6', name: 'Fortune Mustard Oil (1L)', sku: 'OIL-FORT-01', hsn: '15141910', category: 'Grocery', costPrice: 145, sellingPrice: 185, taxRate: 5, stock: 38, minStock: 15, batchNo: 'B-FORT-901', expiryDate: '2027-04-18', warehouse: 'Warehouse Noida-A' },
  { id: 'p7', name: 'Red Label Tea (500g)', sku: 'TEA-RED-500', hsn: '09024020', category: 'Beverages', costPrice: 190, sellingPrice: 235, taxRate: 5, stock: 9, minStock: 12, batchNo: 'B-TEA-320', expiryDate: '2027-10-05', warehouse: 'Warehouse Noida-B' },
  { id: 'p8', name: 'Haldiram Bhujia Sev (350g)', sku: 'SNK-HALD-350', hsn: '21069099', category: 'Snacks', costPrice: 75, sellingPrice: 99, taxRate: 12, stock: 75, minStock: 20, batchNo: 'B-HALD-882', expiryDate: '2026-10-12', warehouse: 'Warehouse Noida-A' },
  { id: 'p9', name: 'Dettol Liquid Handwash (750ml)', sku: 'HW-DETT-750', hsn: '34013011', category: 'Household', costPrice: 90, sellingPrice: 120, taxRate: 18, stock: 14, minStock: 15, batchNo: 'B-DETT-009', expiryDate: '2027-09-30', warehouse: 'Warehouse Noida-B' },
  { id: 'p10', name: 'Britannia Good Day Cookies (200g)', sku: 'CK-BRIT-200', hsn: '19053100', category: 'Snacks', costPrice: 22, sellingPrice: 30, taxRate: 18, stock: 120, minStock: 40, batchNo: 'B-BRIT-101', expiryDate: '2026-06-25', warehouse: 'Warehouse Noida-A' }
];

const DEMO_CUSTOMERS = [
  { id: 'c1', name: 'Gupta Kirana Store', phone: '9876543210', email: 'guptakirana@gmail.com', gstin: '09AAAAA1111A1Z1', city: 'Noida', state: 'Uttar Pradesh', balance: 14500 },
  { id: 'c2', name: 'Rajesh Sharma', phone: '9812345678', email: 'rajesh.sharma@yahoo.com', gstin: '', city: 'Delhi', state: 'Delhi', balance: 1200 },
  { id: 'c3', name: 'Priya Patel', phone: '9765432109', email: 'priyapatel@gmail.com', gstin: '27BBBBB2222B2Z2', city: 'Mumbai', state: 'Maharashtra', balance: 0 },
  { id: 'c4', name: 'Amit Verma', phone: '9988776655', email: 'averma@outlook.com', gstin: '', city: 'Faridabad', state: 'Haryana', balance: -450 },
  { id: 'c5', name: 'Shreya Enterprises', phone: '9555123456', email: 'shreya.ent@gmail.com', gstin: '07CCCCC3333C3Z3', city: 'Gurugram', state: 'Haryana', balance: 6800 }
];

const DEMO_SUPPLIERS = [
  { id: 's1', name: 'ITC Wholesale Noida', contactPerson: 'Sanjay Kumar', phone: '9898989898', email: 'noidasales@itc.in', gstin: '09DDDDD4444D4Z4', dues: 8000 },
  { id: 's2', name: 'HUL Logistics Delhi', contactPerson: 'Vikram Singh', phone: '9797979797', email: 'delhi.dist@hul.com', gstin: '07EEEEE5555E5Z5', dues: 18500 },
  { id: 's3', name: 'Britannia Industries Ltd', contactPerson: 'Anita Rao', phone: '9696969696', email: 'anita.rao@britannia.co.in', gstin: '29FFFFF6666F6Z6', dues: 0 },
  { id: 's4', name: 'Tata Consumer Products', contactPerson: 'Rohan Gupta', phone: '9595959595', email: 'rohan.g@tata.com', gstin: '27GGGGG7777G7Z7', dues: 4200 }
];

const DEMO_INVOICES = [
  {
    invoiceNo: 'INV-2026-001',
    customerId: 'c1',
    customerName: 'Gupta Kirana Store',
    date: '2026-05-10',
    items: [
      { productId: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', qty: 10, price: 260, taxRate: 5, total: 2600 },
      { productId: 'p3', name: 'Tata Salt (1kg)', qty: 20, price: 28, taxRate: 0, total: 560 }
    ],
    subtotal: 3160,
    taxAmount: 130,
    discount: 160,
    grandTotal: 3130,
    paymentStatus: 'Paid',
    amountPaid: 3130,
    paymentMode: 'UPI'
  },
  {
    invoiceNo: 'INV-2026-002',
    customerId: 'c5',
    customerName: 'Shreya Enterprises',
    date: '2026-05-28',
    items: [
      { productId: 'p2', name: 'Surf Excel Easy Wash (1kg)', qty: 15, price: 170, taxRate: 18, total: 2550 },
      { productId: 'p8', name: 'Haldiram Bhujia Sev (350g)', qty: 20, price: 99, taxRate: 12, total: 1980 }
    ],
    subtotal: 4530,
    taxAmount: 696.6,
    discount: 0,
    grandTotal: 5226.6,
    paymentStatus: 'Partially Paid',
    amountPaid: 2000,
    paymentMode: 'Bank Transfer'
  },
  {
    invoiceNo: 'INV-2026-06-001',
    customerId: 'c1',
    customerName: 'Gupta Kirana Store',
    date: '2026-06-02',
    items: [
      { productId: 'p5', name: 'Maggi 2-Min Masala Noodles (12-Pk)', qty: 10, price: 180, taxRate: 18, total: 1800 },
      { productId: 'p6', name: 'Fortune Mustard Oil (1L)', qty: 10, price: 185, taxRate: 5, total: 1850 }
    ],
    subtotal: 3650,
    taxAmount: 416.5,
    discount: 100,
    grandTotal: 3966.5,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    paymentMode: 'N/A'
  }
];

const DEMO_PURCHASES = [
  {
    poNo: 'PO-2026-001',
    supplierId: 's1',
    supplierName: 'ITC Wholesale Noida',
    date: '2026-05-15',
    items: [
      { productId: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', qty: 50, price: 210, taxRate: 5, total: 10500 }
    ],
    subtotal: 10500,
    taxAmount: 525,
    grandTotal: 11025,
    status: 'Received',
    paymentStatus: 'Paid',
    amountPaid: 11025
  },
  {
    poNo: 'PO-2026-002',
    supplierId: 's2',
    supplierName: 'HUL Logistics Delhi',
    date: '2026-05-30',
    items: [
      { productId: 'p2', name: 'Surf Excel Easy Wash (1kg)', qty: 25, price: 130, taxRate: 18, total: 3250 },
      { productId: 'p9', name: 'Dettol Liquid Handwash (750ml)', qty: 20, price: 90, taxRate: 18, total: 1800 }
    ],
    subtotal: 5050,
    taxAmount: 909,
    grandTotal: 5959,
    status: 'Ordered',
    paymentStatus: 'Pending',
    amountPaid: 0
  }
];

const DEMO_BUSINESS_SETTINGS = {
  businessName: 'Apna Bazaar Wholesalers',
  gstin: '09AAAAA1111A1Z1',
  gstType: 'Regular',
  contactNo: '9999888877',
  email: 'admin@vyapora.co.in',
  address: 'Shop No. 14, Main Market, Sector 62, Noida, UP - 201301',
  currency: 'INR',
  financialYearStart: '2026-04-01'
};

const DEMO_SUBSCRIPTION = {
  plan: 'Growth Plan',
  status: 'Active',
  price: 999,
  expiryDate: '2026-07-05',
  trialEnds: '2026-06-12',
  usersAllowed: 5,
  featuresUnlocked: {
    advancedReports: true,
    multiWarehouse: true,
    aiAssistant: true,
    multiUser: true
  }
};

const DEMO_ROLES = [
  { id: 'r1', name: 'Amit Kumar', email: 'amit@vyapora.co.in', role: 'Inventory Manager', active: true },
  { id: 'r2', name: 'Ritu Sharma', email: 'ritu@vyapora.co.in', role: 'Billing Operator', active: true }
];

// Clean Slate Initial Configs (All arrays are empty. Onboarding initiates login)
const INITIAL_PRODUCTS = [];
const INITIAL_CUSTOMERS = [];
const INITIAL_SUPPLIERS = [];
const INITIAL_INVOICES = [];
const INITIAL_PURCHASES = [];
const INITIAL_ROLES = [];

const INITIAL_BUSINESS_SETTINGS = {
  businessName: '',
  gstin: '',
  gstType: 'Regular',
  contactNo: '',
  email: '',
  address: '',
  currency: 'INR',
  financialYearStart: ''
};

const INITIAL_SUBSCRIPTION = {
  plan: 'Free Trial',
  status: 'Active',
  price: 0,
  expiryDate: '2026-07-05',
  trialEnds: '2026-07-05',
  usersAllowed: 1,
  featuresUnlocked: {
    advancedReports: false,
    multiWarehouse: false,
    aiAssistant: true,
    multiUser: false
  }
};

// Load from local storage helper
const getStored = (key, fallback) => {
  const value = localStorage.getItem(`saas_inv_${key}`);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('Error parsing local storage for key: ', key, e);
    }
  }
  return fallback;
};

// Store save helper
const setStored = (key, data) => {
  localStorage.setItem(`saas_inv_${key}`, JSON.stringify(data));
};

export const useMockStore = () => {
  // Authentication states - Starts logged out by default
  const [user, setUser] = useState(() => getStored('auth_user', { loggedIn: false, name: '', email: '', businessName: '' }));
  
  // Data states
  const [products, setProducts] = useState(() => getStored('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => getStored('customers', INITIAL_CUSTOMERS));
  const [suppliers, setSuppliers] = useState(() => getStored('suppliers', INITIAL_SUPPLIERS));
  const [invoices, setInvoices] = useState(() => getStored('invoices', INITIAL_INVOICES));
  const [purchases, setPurchases] = useState(() => getStored('purchases', INITIAL_PURCHASES));
  const [settings, setSettings] = useState(() => getStored('settings', INITIAL_BUSINESS_SETTINGS));
  const [subscription, setSubscription] = useState(() => getStored('subscription', INITIAL_SUBSCRIPTION));
  const [roles, setRoles] = useState(() => getStored('roles', INITIAL_ROLES));
  
  // Notification logs
  const [notifications, setNotifications] = useState([]);

  // Sync back to local storage
  useEffect(() => setStored('auth_user', user), [user]);
  useEffect(() => setStored('products', products), [products]);
  useEffect(() => setStored('customers', customers), [customers]);
  useEffect(() => setStored('suppliers', suppliers), [suppliers]);
  useEffect(() => setStored('invoices', invoices), [invoices]);
  useEffect(() => setStored('purchases', purchases), [purchases]);
  useEffect(() => setStored('settings', settings), [settings]);
  useEffect(() => setStored('subscription', subscription), [subscription]);
  useEffect(() => setStored('roles', roles), [roles]);

  // Generate real-time alerts from database
  useEffect(() => {
    const alerts = [];
    
    // 1. Low stock alerts
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
    });

    // 2. Expiry warnings (within 30 days of June 5, 2026)
    const today = new Date('2026-06-05');
    products.forEach(p => {
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

    // 3. Pending payments (partially paid / unpaid older sales invoices)
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

    setNotifications(alerts);
  }, [products, invoices]);

  // Actions
  const addProduct = (prod) => {
    const newProd = {
      ...prod,
      id: `p${Date.now()}`,
      stock: Number(prod.stock || 0),
      minStock: Number(prod.minStock || 0),
      costPrice: Number(prod.costPrice || 0),
      sellingPrice: Number(prod.sellingPrice || 0),
      taxRate: Number(prod.taxRate || 0)
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? {
      ...updatedProd,
      stock: Number(updatedProd.stock),
      minStock: Number(updatedProd.minStock),
      costPrice: Number(updatedProd.costPrice),
      sellingPrice: Number(updatedProd.sellingPrice),
      taxRate: Number(updatedProd.taxRate)
    } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCustomer = (cust) => {
    const newCust = {
      ...cust,
      id: `c${Date.now()}`,
      balance: Number(cust.balance || 0)
    };
    setCustomers(prev => [newCust, ...prev]);
  };

  const updateCustomer = (updatedCust) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? {
      ...updatedCust,
      balance: Number(updatedCust.balance)
    } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = (supp) => {
    const newSupp = {
      ...supp,
      id: `s${Date.now()}`,
      dues: Number(supp.dues || 0)
    };
    setSuppliers(prev => [newSupp, ...prev]);
  };

  const updateSupplier = (updatedSupp) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupp.id ? {
      ...updatedSupp,
      dues: Number(updatedSupp.dues)
    } : s));
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Add a Sales Invoice & update stock + customer balance
  const addInvoice = (invoiceData) => {
    const newInv = {
      ...invoiceData,
      invoiceNo: `INV-2026-06-${String(invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Update Inventory stock levels
    setProducts(prevProds => {
      return prevProds.map(p => {
        const itemInInv = newInv.items.find(item => item.productId === p.id);
        if (itemInInv) {
          return { ...p, stock: Math.max(0, p.stock - itemInInv.qty) };
        }
        return p;
      });
    });

    // 2. Update Customer outstanding balance
    const unpaidAmt = newInv.grandTotal - newInv.amountPaid;
    if (unpaidAmt !== 0 && newInv.customerId) {
      setCustomers(prevCusts => {
        return prevCusts.map(c => {
          if (c.id === newInv.customerId) {
            return { ...c, balance: c.balance + unpaidAmt };
          }
          return c;
        });
      });
    }

    setInvoices(prev => [newInv, ...prev]);
  };

  // Add a Purchase Order & update stock + supplier dues
  const addPurchaseOrder = (poData) => {
    const newPO = {
      ...poData,
      poNo: `PO-2026-06-${String(purchases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Received'
    };

    // 1. Add Stock
    setProducts(prevProds => {
      return prevProds.map(p => {
        const itemInPO = newPO.items.find(item => item.productId === p.id);
        if (itemInPO) {
          return { ...p, stock: p.stock + itemInPO.qty };
        }
        return p;
      });
    });

    // 2. Increase supplier dues by unpaid amount
    const unpaidAmt = newPO.grandTotal - newPO.amountPaid;
    if (unpaidAmt !== 0 && newPO.supplierId) {
      setSuppliers(prevSupps => {
        return prevSupps.map(s => {
          if (s.id === newPO.supplierId) {
            return { ...s, dues: s.dues + unpaidAmt };
          }
          return s;
        });
      });
    }

    setPurchases(prev => [newPO, ...prev]);
  };

  // Record a Customer Payment Receipt
  const recordCustomerPayment = (customerId, amount, paymentMode) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, balance: c.balance - amount };
      }
      return c;
    }));

    setInvoices(prevInvs => {
      let remainingPayment = amount;
      return prevInvs.map(inv => {
        if (inv.customerId === customerId && inv.paymentStatus !== 'Paid' && remainingPayment > 0) {
          const unpaid = inv.grandTotal - inv.amountPaid;
          if (remainingPayment >= unpaid) {
            remainingPayment -= unpaid;
            return { ...inv, amountPaid: inv.grandTotal, paymentStatus: 'Paid', paymentMode };
          } else {
            const newPaid = inv.amountPaid + remainingPayment;
            remainingPayment = 0;
            return { ...inv, amountPaid: newPaid, paymentStatus: 'Partially Paid', paymentMode };
          }
        }
        return inv;
      });
    });
  };

  // Record a Supplier Payment Made
  const recordSupplierPayment = (supplierId, amount) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, dues: Math.max(0, s.dues - amount) };
      }
      return s;
    }));

    setPurchases(prevPOs => {
      let remainingPayment = amount;
      return prevPOs.map(po => {
        if (po.supplierId === supplierId && po.paymentStatus !== 'Paid' && remainingPayment > 0) {
          const unpaid = po.grandTotal - po.amountPaid;
          if (remainingPayment >= unpaid) {
            remainingPayment -= unpaid;
            return { ...po, amountPaid: po.grandTotal, paymentStatus: 'Paid' };
          } else {
            const newPaid = po.amountPaid + remainingPayment;
            remainingPayment = 0;
            return { ...po, amountPaid: newPaid, paymentStatus: 'Pending' };
          }
        }
        return po;
      });
    });
  };

  // Update subscription details
  const updateSubscriptionPlan = (planName, priceValue, users) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    
    setSubscription({
      plan: planName,
      status: 'Active',
      price: priceValue,
      expiryDate: expiry.toISOString().split('T')[0],
      usersAllowed: users,
      featuresUnlocked: {
        advancedReports: planName !== 'Free Trial',
        multiWarehouse: planName === 'Wholesaler Pro',
        aiAssistant: true,
        multiUser: planName !== 'Free Trial'
      }
    });
  };

  // Add Roles Team User
  const addTeamMember = (name, email, role) => {
    setRoles(prev => [...prev, { id: `r${Date.now()}`, name, email, role, active: true }]);
  };

  const deleteTeamMember = (id) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const toggleTeamMemberStatus = (id) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  // Logout/Login simulation
  const loginUser = (email, business) => {
    setUser({ loggedIn: true, name: 'Varun Singh', email, businessName: business });
  };

  const logoutUser = () => {
    setUser({ loggedIn: false, name: '', email: '', businessName: '' });
  };

  // Seeder Action
  const loadDemoData = () => {
    setProducts(DEMO_PRODUCTS);
    setCustomers(DEMO_CUSTOMERS);
    setSuppliers(DEMO_SUPPLIERS);
    setInvoices(DEMO_INVOICES);
    setPurchases(DEMO_PURCHASES);
    setSettings(DEMO_BUSINESS_SETTINGS);
    setSubscription(DEMO_SUBSCRIPTION);
    setRoles(DEMO_ROLES);
    setUser({ loggedIn: true, name: 'Varun Singh', email: 'admin@vyapora.co.in', businessName: 'Apna Bazaar Wholesalers' });
  };

  // Purge Action
  const clearAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setInvoices(INITIAL_INVOICES);
    setPurchases(INITIAL_PURCHASES);
    setSettings(INITIAL_BUSINESS_SETTINGS);
    setSubscription(INITIAL_SUBSCRIPTION);
    setRoles(INITIAL_ROLES);
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
    logoutUser,
    loadDemoData,
    clearAllData
  };
};
