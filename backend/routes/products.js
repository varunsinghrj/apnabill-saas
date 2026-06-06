const express = require('express');
const { db, uuidv4, formatProduct } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/products
router.get('/', (req, res) => {
  try {
    const rows = db.get('products').filter({ user_id: req.user.id }).value();
    res.json(rows.map(formatProduct));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const { name, sku, hsn, category, costPrice, sellingPrice, taxRate, stock, minStock, batchNo, expiryDate, warehouse } = req.body;
    const id = `p${Date.now()}`;
    const row = { id, user_id: req.user.id, name, sku: sku || '', hsn: hsn || '', category: category || '', cost_price: Number(costPrice) || 0, selling_price: Number(sellingPrice) || 0, tax_rate: Number(taxRate) || 0, stock: Number(stock) || 0, min_stock: Number(minStock) || 0, batch_no: batchNo || '', expiry_date: expiryDate || '', warehouse: warehouse || '', created_at: new Date().toISOString() };
    db.get('products').push(row).write();
    res.status(201).json(formatProduct(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  try {
    const { name, sku, hsn, category, costPrice, sellingPrice, taxRate, stock, minStock, batchNo, expiryDate, warehouse } = req.body;
    const existing = db.get('products').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.get('products').find({ id: req.params.id, user_id: req.user.id }).assign({ name, sku: sku || '', hsn: hsn || '', category: category || '', cost_price: Number(costPrice) || 0, selling_price: Number(sellingPrice) || 0, tax_rate: Number(taxRate) || 0, stock: Number(stock) || 0, min_stock: Number(minStock) || 0, batch_no: batchNo || '', expiry_date: expiryDate || '', warehouse: warehouse || '' }).write();
    const updated = db.get('products').find({ id: req.params.id }).value();
    res.json(formatProduct(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.get('products').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    db.get('products').remove({ id: req.params.id, user_id: req.user.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
