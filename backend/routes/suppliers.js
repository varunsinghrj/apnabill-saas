const express = require('express');
const { db, uuidv4, formatSupplier } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/suppliers
router.get('/', (req, res) => {
  try {
    const rows = db.get('suppliers').filter({ user_id: req.user.id }).value();
    res.json(rows.map(formatSupplier));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// POST /api/suppliers
router.post('/', (req, res) => {
  try {
    const { name, contactPerson, phone, email, gstin, dues } = req.body;
    const id = `s${Date.now()}`;
    const row = { id, user_id: req.user.id, name, contact_person: contactPerson || '', phone: phone || '', email: email || '', gstin: gstin || '', dues: Number(dues) || 0, created_at: new Date().toISOString() };
    db.get('suppliers').push(row).write();
    res.status(201).json(formatSupplier(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', (req, res) => {
  try {
    const { name, contactPerson, phone, email, gstin, dues } = req.body;
    const existing = db.get('suppliers').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Supplier not found' });
    db.get('suppliers').find({ id: req.params.id, user_id: req.user.id }).assign({ name, contact_person: contactPerson || '', phone: phone || '', email: email || '', gstin: gstin || '', dues: Number(dues) || 0 }).write();
    const updated = db.get('suppliers').find({ id: req.params.id }).value();
    res.json(formatSupplier(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.get('suppliers').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Supplier not found' });
    db.get('suppliers').remove({ id: req.params.id, user_id: req.user.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// POST /api/suppliers/:supplierId/payment
router.post('/:supplierId/payment', (req, res) => {
  try {
    const { amount } = req.body;
    const { supplierId } = req.params;
    const userId = req.user.id;

    const supplier = db.get('suppliers').find({ id: supplierId, user_id: userId }).value();
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    // Reduce dues
    db.get('suppliers').find({ id: supplierId, user_id: userId }).assign({ dues: Math.max(0, supplier.dues - Number(amount)) }).write();

    // Apply to unpaid POs FIFO
    const unpaidPOs = db.get('purchases').filter(po => po.supplier_id === supplierId && po.user_id === userId && po.payment_status !== 'Paid').sortBy('created_at').value();
    let remaining = Number(amount);
    unpaidPOs.forEach(po => {
      if (remaining <= 0) return;
      const unpaid = po.grand_total - po.amount_paid;
      if (remaining >= unpaid) {
        db.get('purchases').find({ po_no: po.po_no }).assign({ amount_paid: po.grand_total, payment_status: 'Paid' }).write();
        remaining -= unpaid;
      } else {
        db.get('purchases').find({ po_no: po.po_no }).assign({ amount_paid: po.amount_paid + remaining, payment_status: 'Pending' }).write();
        remaining = 0;
      }
    });

    const updatedSupplier = db.get('suppliers').find({ id: supplierId }).value();
    res.json({ supplier: formatSupplier(updatedSupplier) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;
