const express = require('express');
const { db, uuidv4, formatPurchaseWithItems } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/purchases
router.get('/', (req, res) => {
  try {
    const rows = db.get('purchases').filter({ user_id: req.user.id }).sortBy('created_at').reverse().value();
    res.json(rows.map(po => formatPurchaseWithItems(po)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// POST /api/purchases
router.post('/', (req, res) => {
  try {
    const { supplierId, supplierName, items, subtotal, taxAmount, grandTotal, paymentStatus, amountPaid } = req.body;
    const userId = req.user.id;
    const now = new Date().toISOString();

    const count = db.get('purchases').filter({ user_id: userId }).value().length;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const poNo = `PO-${today}-${String(count + 1).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    // 1. Insert PO
    const poRow = { po_no: poNo, user_id: userId, supplier_id: supplierId || null, supplier_name: supplierName || '', date, subtotal: Number(subtotal) || 0, tax_amount: Number(taxAmount) || 0, grand_total: Number(grandTotal) || 0, status: 'Received', payment_status: paymentStatus || 'Pending', amount_paid: Number(amountPaid) || 0, created_at: now };
    db.get('purchases').push(poRow).write();

    // 2. Insert items
    (items || []).forEach(item => {
      db.get('purchase_items').push({ id: uuidv4(), po_no: poNo, user_id: userId, product_id: item.productId || null, name: item.name || '', qty: Number(item.qty) || 0, price: Number(item.price) || 0, tax_rate: Number(item.taxRate) || 0, total: Number(item.total) || 0 }).write();
    });

    // 3. Add stock
    (items || []).forEach(item => {
      if (item.productId) {
        const prod = db.get('products').find({ id: item.productId, user_id: userId }).value();
        if (prod) {
          db.get('products').find({ id: item.productId, user_id: userId }).assign({ stock: prod.stock + Number(item.qty) }).write();
        }
      }
    });

    // 4. Update supplier dues
    const unpaidAmt = Number(grandTotal) - Number(amountPaid);
    if (unpaidAmt !== 0 && supplierId) {
      const supp = db.get('suppliers').find({ id: supplierId, user_id: userId }).value();
      if (supp) {
        db.get('suppliers').find({ id: supplierId, user_id: userId }).assign({ dues: supp.dues + unpaidAmt }).write();
      }
    }

    res.status(201).json(formatPurchaseWithItems(poRow));
  } catch (err) {
    console.error('Purchase create error:', err);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// PUT /api/purchases/:poNo
router.put('/:poNo', (req, res) => {
  try {
    const { status, paymentStatus, amountPaid } = req.body;
    const existing = db.get('purchases').find({ po_no: req.params.poNo, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Purchase not found' });
    db.get('purchases').find({ po_no: req.params.poNo, user_id: req.user.id }).assign({ status: status || 'Received', payment_status: paymentStatus || 'Pending', amount_paid: Number(amountPaid) || 0 }).write();
    const updated = db.get('purchases').find({ po_no: req.params.poNo }).value();
    res.json(formatPurchaseWithItems(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

module.exports = router;
