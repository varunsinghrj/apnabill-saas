const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './apnabill.db.json';
const adapter = new FileSync(path.resolve(DB_PATH));
const db = low(adapter);

// ─── Default Database Shape ──────────────────────────────────────────────────
db.defaults({
  users: [],
  settings: [],
  subscriptions: [],
  products: [],
  customers: [],
  suppliers: [],
  invoices: [],
  invoice_items: [],
  purchases: [],
  purchase_items: [],
  roles: []
}).write();

// ─── Demo Data ───────────────────────────────────────────────────────────────
function seedDemoData(userId) {
  const now = new Date().toISOString();

  // Settings
  const existingSettings = db.get('settings').find({ user_id: userId }).value();
  if (!existingSettings) {
    db.get('settings').push({
      id: uuidv4(), user_id: userId,
      business_name: 'Apna Bazaar Wholesalers',
      gstin: '09AAAAA1111A1Z1', gst_type: 'Regular',
      contact_no: '9999888877', email: 'admin@vyapora.co.in',
      address: 'Shop No. 14, Main Market, Sector 62, Noida, UP - 201301',
      currency: 'INR', financial_year_start: '2026-04-01'
    }).write();
  } else {
    db.get('settings').find({ user_id: userId }).assign({
      business_name: 'Apna Bazaar Wholesalers',
      gstin: '09AAAAA1111A1Z1', gst_type: 'Regular',
      contact_no: '9999888877', email: 'admin@vyapora.co.in',
      address: 'Shop No. 14, Main Market, Sector 62, Noida, UP - 201301',
      currency: 'INR', financial_year_start: '2026-04-01'
    }).write();
  }

  // Subscription
  const existingSub = db.get('subscriptions').find({ user_id: userId }).value();
  if (!existingSub) {
    db.get('subscriptions').push({
      id: uuidv4(), user_id: userId,
      plan: 'Growth Plan', status: 'Active', price: 999,
      expiry_date: '2026-07-05', trial_ends: '2026-06-12',
      users_allowed: 5, advanced_reports: true, multi_warehouse: true,
      ai_assistant: true, multi_user: true
    }).write();
  }

  // Clear & reseed products
  db.get('products').remove({ user_id: userId }).write();
  const demoProducts = [
    { id: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', sku: 'ATT-AASH-05', hsn: '11010000', category: 'Grocery', cost_price: 210, selling_price: 260, tax_rate: 5, stock: 45, min_stock: 15, batch_no: 'B-ATT-889', expiry_date: '2026-11-20', warehouse: 'Warehouse Noida-A' },
    { id: 'p2', name: 'Surf Excel Easy Wash (1kg)', sku: 'DET-SURF-01', hsn: '34029099', category: 'Household', cost_price: 130, selling_price: 170, tax_rate: 18, stock: 12, min_stock: 20, batch_no: 'B-SURF-122', expiry_date: '2028-05-15', warehouse: 'Warehouse Noida-B' },
    { id: 'p3', name: 'Tata Salt (1kg)', sku: 'SLT-TATA-01', hsn: '25010000', category: 'Grocery', cost_price: 22, selling_price: 28, tax_rate: 0, stock: 110, min_stock: 30, batch_no: 'B-TATA-554', expiry_date: '2027-12-10', warehouse: 'Warehouse Noida-A' },
    { id: 'p4', name: 'Amul Butter (500g)', sku: 'BUT-AMUL-500', hsn: '04051000', category: 'Dairy', cost_price: 215, selling_price: 265, tax_rate: 12, stock: 8, min_stock: 10, batch_no: 'B-AMUL-012', expiry_date: '2026-07-02', warehouse: 'Cold Storage Noida' },
    { id: 'p5', name: 'Maggi 2-Min Masala Noodles (12-Pk)', sku: 'NDL-MAGG-12', hsn: '19023010', category: 'Grocery', cost_price: 140, selling_price: 180, tax_rate: 18, stock: 65, min_stock: 25, batch_no: 'B-MAGG-404', expiry_date: '2026-12-25', warehouse: 'Warehouse Noida-B' },
    { id: 'p6', name: 'Fortune Mustard Oil (1L)', sku: 'OIL-FORT-01', hsn: '15141910', category: 'Grocery', cost_price: 145, selling_price: 185, tax_rate: 5, stock: 38, min_stock: 15, batch_no: 'B-FORT-901', expiry_date: '2027-04-18', warehouse: 'Warehouse Noida-A' },
    { id: 'p7', name: 'Red Label Tea (500g)', sku: 'TEA-RED-500', hsn: '09024020', category: 'Beverages', cost_price: 190, selling_price: 235, tax_rate: 5, stock: 9, min_stock: 12, batch_no: 'B-TEA-320', expiry_date: '2027-10-05', warehouse: 'Warehouse Noida-B' },
    { id: 'p8', name: 'Haldiram Bhujia Sev (350g)', sku: 'SNK-HALD-350', hsn: '21069099', category: 'Snacks', cost_price: 75, selling_price: 99, tax_rate: 12, stock: 75, min_stock: 20, batch_no: 'B-HALD-882', expiry_date: '2026-10-12', warehouse: 'Warehouse Noida-A' },
    { id: 'p9', name: 'Dettol Liquid Handwash (750ml)', sku: 'HW-DETT-750', hsn: '34013011', category: 'Household', cost_price: 90, selling_price: 120, tax_rate: 18, stock: 14, min_stock: 15, batch_no: 'B-DETT-009', expiry_date: '2027-09-30', warehouse: 'Warehouse Noida-B' },
    { id: 'p10', name: 'Britannia Good Day Cookies (200g)', sku: 'CK-BRIT-200', hsn: '19053100', category: 'Snacks', cost_price: 22, selling_price: 30, tax_rate: 18, stock: 120, min_stock: 40, batch_no: 'B-BRIT-101', expiry_date: '2026-06-25', warehouse: 'Warehouse Noida-A' },
  ];
  demoProducts.forEach(p => db.get('products').push({ ...p, user_id: userId, created_at: now }).write());

  // Customers
  db.get('customers').remove({ user_id: userId }).write();
  const demoCustomers = [
    { id: 'c1', name: 'Gupta Kirana Store', phone: '9876543210', email: 'guptakirana@gmail.com', gstin: '09AAAAA1111A1Z1', city: 'Noida', state: 'Uttar Pradesh', balance: 14500 },
    { id: 'c2', name: 'Rajesh Sharma', phone: '9812345678', email: 'rajesh.sharma@yahoo.com', gstin: '', city: 'Delhi', state: 'Delhi', balance: 1200 },
    { id: 'c3', name: 'Priya Patel', phone: '9765432109', email: 'priyapatel@gmail.com', gstin: '27BBBBB2222B2Z2', city: 'Mumbai', state: 'Maharashtra', balance: 0 },
    { id: 'c4', name: 'Amit Verma', phone: '9988776655', email: 'averma@outlook.com', gstin: '', city: 'Faridabad', state: 'Haryana', balance: -450 },
    { id: 'c5', name: 'Shreya Enterprises', phone: '9555123456', email: 'shreya.ent@gmail.com', gstin: '07CCCCC3333C3Z3', city: 'Gurugram', state: 'Haryana', balance: 6800 },
  ];
  demoCustomers.forEach(c => db.get('customers').push({ ...c, user_id: userId, created_at: now }).write());

  // Suppliers
  db.get('suppliers').remove({ user_id: userId }).write();
  const demoSuppliers = [
    { id: 's1', name: 'ITC Wholesale Noida', contact_person: 'Sanjay Kumar', phone: '9898989898', email: 'noidasales@itc.in', gstin: '09DDDDD4444D4Z4', dues: 8000 },
    { id: 's2', name: 'HUL Logistics Delhi', contact_person: 'Vikram Singh', phone: '9797979797', email: 'delhi.dist@hul.com', gstin: '07EEEEE5555E5Z5', dues: 18500 },
    { id: 's3', name: 'Britannia Industries Ltd', contact_person: 'Anita Rao', phone: '9696969696', email: 'anita.rao@britannia.co.in', gstin: '29FFFFF6666F6Z6', dues: 0 },
    { id: 's4', name: 'Tata Consumer Products', contact_person: 'Rohan Gupta', phone: '9595959595', email: 'rohan.g@tata.com', gstin: '27GGGGG7777G7Z7', dues: 4200 },
  ];
  demoSuppliers.forEach(s => db.get('suppliers').push({ ...s, user_id: userId, created_at: now }).write());

  // Roles
  db.get('roles').remove({ user_id: userId }).write();
  db.get('roles').push({ id: 'r1', user_id: userId, name: 'Amit Kumar', email: 'amit@vyapora.co.in', role: 'Inventory Manager', active: true, created_at: now }).write();
  db.get('roles').push({ id: 'r2', user_id: userId, name: 'Ritu Sharma', email: 'ritu@vyapora.co.in', role: 'Billing Operator', active: true, created_at: now }).write();

  // Invoices & items
  db.get('invoices').remove({ user_id: userId }).write();
  db.get('invoice_items').remove({ user_id: userId }).write();

  const invData = [
    {
      invoice_no: 'INV-2026-001', customer_id: 'c1', customer_name: 'Gupta Kirana Store', date: '2026-05-10',
      subtotal: 3160, tax_amount: 130, discount: 160, grand_total: 3130, payment_status: 'Paid', amount_paid: 3130, payment_mode: 'UPI',
      items: [
        { product_id: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', qty: 10, price: 260, tax_rate: 5, total: 2600 },
        { product_id: 'p3', name: 'Tata Salt (1kg)', qty: 20, price: 28, tax_rate: 0, total: 560 },
      ]
    },
    {
      invoice_no: 'INV-2026-002', customer_id: 'c5', customer_name: 'Shreya Enterprises', date: '2026-05-28',
      subtotal: 4530, tax_amount: 696.6, discount: 0, grand_total: 5226.6, payment_status: 'Partially Paid', amount_paid: 2000, payment_mode: 'Bank Transfer',
      items: [
        { product_id: 'p2', name: 'Surf Excel Easy Wash (1kg)', qty: 15, price: 170, tax_rate: 18, total: 2550 },
        { product_id: 'p8', name: 'Haldiram Bhujia Sev (350g)', qty: 20, price: 99, tax_rate: 12, total: 1980 },
      ]
    },
    {
      invoice_no: 'INV-2026-06-001', customer_id: 'c1', customer_name: 'Gupta Kirana Store', date: '2026-06-02',
      subtotal: 3650, tax_amount: 416.5, discount: 100, grand_total: 3966.5, payment_status: 'Unpaid', amount_paid: 0, payment_mode: 'N/A',
      items: [
        { product_id: 'p5', name: 'Maggi 2-Min Masala Noodles (12-Pk)', qty: 10, price: 180, tax_rate: 18, total: 1800 },
        { product_id: 'p6', name: 'Fortune Mustard Oil (1L)', qty: 10, price: 185, tax_rate: 5, total: 1850 },
      ]
    }
  ];
  invData.forEach(inv => {
    const { items, ...invRow } = inv;
    db.get('invoices').push({ ...invRow, user_id: userId, created_at: now }).write();
    items.forEach(item => db.get('invoice_items').push({ id: uuidv4(), invoice_no: inv.invoice_no, user_id: userId, ...item }).write());
  });

  // Purchases & items
  db.get('purchases').remove({ user_id: userId }).write();
  db.get('purchase_items').remove({ user_id: userId }).write();

  const poData = [
    {
      po_no: 'PO-2026-001', supplier_id: 's1', supplier_name: 'ITC Wholesale Noida', date: '2026-05-15',
      subtotal: 10500, tax_amount: 525, grand_total: 11025, status: 'Received', payment_status: 'Paid', amount_paid: 11025,
      items: [{ product_id: 'p1', name: 'Aashirvaad Shudh Chakki Atta (5kg)', qty: 50, price: 210, tax_rate: 5, total: 10500 }]
    },
    {
      po_no: 'PO-2026-002', supplier_id: 's2', supplier_name: 'HUL Logistics Delhi', date: '2026-05-30',
      subtotal: 5050, tax_amount: 909, grand_total: 5959, status: 'Ordered', payment_status: 'Pending', amount_paid: 0,
      items: [
        { product_id: 'p2', name: 'Surf Excel Easy Wash (1kg)', qty: 25, price: 130, tax_rate: 18, total: 3250 },
        { product_id: 'p9', name: 'Dettol Liquid Handwash (750ml)', qty: 20, price: 90, tax_rate: 18, total: 1800 },
      ]
    }
  ];
  poData.forEach(po => {
    const { items, ...poRow } = po;
    db.get('purchases').push({ ...poRow, user_id: userId, created_at: now }).write();
    items.forEach(item => db.get('purchase_items').push({ id: uuidv4(), po_no: po.po_no, user_id: userId, ...item }).write());
  });
}

// ─── Row Formatters ──────────────────────────────────────────────────────────
function formatProduct(row) {
  return { id: row.id, name: row.name, sku: row.sku, hsn: row.hsn, category: row.category, costPrice: row.cost_price, sellingPrice: row.selling_price, taxRate: row.tax_rate, stock: row.stock, minStock: row.min_stock, batchNo: row.batch_no, expiryDate: row.expiry_date, warehouse: row.warehouse };
}

function formatCustomer(row) {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email, gstin: row.gstin, city: row.city, state: row.state, balance: row.balance };
}

function formatSupplier(row) {
  return { id: row.id, name: row.name, contactPerson: row.contact_person, phone: row.phone, email: row.email, gstin: row.gstin, dues: row.dues };
}

function formatInvoiceWithItems(inv, userId) {
  const items = db.get('invoice_items').filter({ invoice_no: inv.invoice_no, user_id: inv.user_id }).value();
  return {
    invoiceNo: inv.invoice_no, customerId: inv.customer_id, customerName: inv.customer_name, date: inv.date,
    items: items.map(i => ({ productId: i.product_id, name: i.name, qty: i.qty, price: i.price, taxRate: i.tax_rate, total: i.total })),
    subtotal: inv.subtotal, taxAmount: inv.tax_amount, discount: inv.discount, grandTotal: inv.grand_total,
    paymentStatus: inv.payment_status, amountPaid: inv.amount_paid, paymentMode: inv.payment_mode,
  };
}

function formatPurchaseWithItems(po) {
  const items = db.get('purchase_items').filter({ po_no: po.po_no, user_id: po.user_id }).value();
  return {
    poNo: po.po_no, supplierId: po.supplier_id, supplierName: po.supplier_name, date: po.date,
    items: items.map(i => ({ productId: i.product_id, name: i.name, qty: i.qty, price: i.price, taxRate: i.tax_rate, total: i.total })),
    subtotal: po.subtotal, taxAmount: po.tax_amount, grandTotal: po.grand_total,
    status: po.status, paymentStatus: po.payment_status, amountPaid: po.amount_paid,
  };
}

function formatSettings(row) {
  if (!row) return { businessName: '', gstin: '', gstType: 'Regular', contactNo: '', email: '', address: '', currency: 'INR', financialYearStart: '' };
  return { businessName: row.business_name, gstin: row.gstin, gstType: row.gst_type, contactNo: row.contact_no, email: row.email, address: row.address, currency: row.currency, financialYearStart: row.financial_year_start };
}

function formatSubscription(row) {
  if (!row) return { plan: 'None', status: 'Pending Payment', price: 0, expiryDate: '', trialEnds: '', usersAllowed: 0, featuresUnlocked: { advancedReports: false, multiWarehouse: false, aiAssistant: false, multiUser: false } };
  return { plan: row.plan, status: row.status, price: row.price, expiryDate: row.expiry_date, trialEnds: row.trial_ends, usersAllowed: row.users_allowed, featuresUnlocked: { advancedReports: !!row.advanced_reports, multiWarehouse: !!row.multi_warehouse, aiAssistant: !!row.ai_assistant, multiUser: !!row.multi_user } };
}

function formatRole(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, active: !!row.active };
}

module.exports = { db, uuidv4, seedDemoData, formatProduct, formatCustomer, formatSupplier, formatInvoiceWithItems, formatPurchaseWithItems, formatSettings, formatSubscription, formatRole };
