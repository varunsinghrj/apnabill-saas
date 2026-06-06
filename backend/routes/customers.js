const express = require('express');
const { db, uuidv4, formatCustomer } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/customers
router.get('/', (req, res) => {
  try {
    const rows = db.get('customers').filter({ user_id: req.user.id }).value();
    res.json(rows.map(formatCustomer));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST /api/customers
router.post('/', (req, res) => {
  try {
    const { name, phone, email, gstin, city, state, balance } = req.body;
    const id = `c${Date.now()}`;
    const row = { id, user_id: req.user.id, name, phone: phone || '', email: email || '', gstin: gstin || '', city: city || '', state: state || '', balance: Number(balance) || 0, created_at: new Date().toISOString() };
    db.get('customers').push(row).write();
    res.status(201).json(formatCustomer(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id
router.put('/:id', (req, res) => {
  try {
    const { name, phone, email, gstin, city, state, balance } = req.body;
    const existing = db.get('customers').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    db.get('customers').find({ id: req.params.id, user_id: req.user.id }).assign({ name, phone: phone || '', email: email || '', gstin: gstin || '', city: city || '', state: state || '', balance: Number(balance) || 0 }).write();
    const updated = db.get('customers').find({ id: req.params.id }).value();
    res.json(formatCustomer(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.get('customers').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    db.get('customers').remove({ id: req.params.id, user_id: req.user.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// POST /api/customers/:customerId/payment
router.post('/:customerId/payment', (req, res) => {
  try {
    const { amount, paymentMode } = req.body;
    const { customerId } = req.params;
    const userId = req.user.id;

    const customer = db.get('customers').find({ id: customerId, user_id: userId }).value();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Reduce customer balance
    db.get('customers').find({ id: customerId, user_id: userId }).assign({ balance: customer.balance - Number(amount) }).write();

    // Apply to unpaid invoices FIFO
    const unpaidInvoices = db.get('invoices').filter(inv => inv.customer_id === customerId && inv.user_id === userId && inv.payment_status !== 'Paid').sortBy('created_at').value();
    let remaining = Number(amount);
    unpaidInvoices.forEach(inv => {
      if (remaining <= 0) return;
      const unpaid = inv.grand_total - inv.amount_paid;
      if (remaining >= unpaid) {
        db.get('invoices').find({ invoice_no: inv.invoice_no }).assign({ amount_paid: inv.grand_total, payment_status: 'Paid', payment_mode: paymentMode || 'Cash' }).write();
        remaining -= unpaid;
      } else {
        db.get('invoices').find({ invoice_no: inv.invoice_no }).assign({ amount_paid: inv.amount_paid + remaining, payment_status: 'Partially Paid', payment_mode: paymentMode || 'Cash' }).write();
        remaining = 0;
      }
    });

    const updatedCustomer = db.get('customers').find({ id: customerId }).value();
    res.json({ customer: formatCustomer(updatedCustomer) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;
