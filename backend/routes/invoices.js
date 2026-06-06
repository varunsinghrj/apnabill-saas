const express = require('express');
const { db, uuidv4, formatInvoiceWithItems } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/invoices
router.get('/', (req, res) => {
  try {
    const rows = db.get('invoices').filter({ user_id: req.user.id }).sortBy('created_at').reverse().value();
    res.json(rows.map(inv => formatInvoiceWithItems(inv)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/invoices
router.post('/', (req, res) => {
  try {
    const { customerId, customerName, items, subtotal, taxAmount, discount, grandTotal, paymentStatus, amountPaid, paymentMode } = req.body;
    const userId = req.user.id;
    const now = new Date().toISOString();

    const count = db.get('invoices').filter({ user_id: userId }).value().length;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const invoiceNo = `INV-${today}-${String(count + 1).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    // 1. Insert invoice
    const invRow = { invoice_no: invoiceNo, user_id: userId, customer_id: customerId || null, customer_name: customerName || '', date, subtotal: Number(subtotal) || 0, tax_amount: Number(taxAmount) || 0, discount: Number(discount) || 0, grand_total: Number(grandTotal) || 0, payment_status: paymentStatus || 'Unpaid', amount_paid: Number(amountPaid) || 0, payment_mode: paymentMode || 'N/A', created_at: now };
    db.get('invoices').push(invRow).write();

    // 2. Insert items
    (items || []).forEach(item => {
      db.get('invoice_items').push({ id: uuidv4(), invoice_no: invoiceNo, user_id: userId, product_id: item.productId || null, name: item.name || '', qty: Number(item.qty) || 0, price: Number(item.price) || 0, tax_rate: Number(item.taxRate) || 0, total: Number(item.total) || 0 }).write();
    });

    // 3. Deduct product stock
    (items || []).forEach(item => {
      if (item.productId) {
        const prod = db.get('products').find({ id: item.productId, user_id: userId }).value();
        if (prod) {
          db.get('products').find({ id: item.productId, user_id: userId }).assign({ stock: Math.max(0, prod.stock - Number(item.qty)) }).write();
        }
      }
    });

    // 4. Update customer balance
    const unpaidAmt = Number(grandTotal) - Number(amountPaid);
    if (unpaidAmt !== 0 && customerId) {
      const cust = db.get('customers').find({ id: customerId, user_id: userId }).value();
      if (cust) {
        db.get('customers').find({ id: customerId, user_id: userId }).assign({ balance: cust.balance + unpaidAmt }).write();
      }
    }

    res.status(201).json(formatInvoiceWithItems(invRow));
  } catch (err) {
    console.error('Invoice create error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// PUT /api/invoices/:invoiceNo
router.put('/:invoiceNo', (req, res) => {
  try {
    const { paymentStatus, amountPaid, paymentMode } = req.body;
    const existing = db.get('invoices').find({ invoice_no: req.params.invoiceNo, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });
    db.get('invoices').find({ invoice_no: req.params.invoiceNo, user_id: req.user.id }).assign({ payment_status: paymentStatus, amount_paid: Number(amountPaid) || 0, payment_mode: paymentMode || 'N/A' }).write();
    const updated = db.get('invoices').find({ invoice_no: req.params.invoiceNo }).value();
    res.json(formatInvoiceWithItems(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

module.exports = router;
