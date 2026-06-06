const express = require('express');
const { db, uuidv4, formatSettings, formatSubscription } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const row = db.get('settings').find({ user_id: req.user.id }).value();
    res.json(formatSettings(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const { businessName, gstin, gstType, contactNo, email, address, currency, financialYearStart } = req.body;
    const existing = db.get('settings').find({ user_id: req.user.id }).value();
    const data = {
      business_name: businessName || '',
      gstin: gstin || '',
      gst_type: gstType || 'Regular',
      contact_no: contactNo || '',
      email: email || '',
      address: address || '',
      currency: currency || 'INR',
      financial_year_start: financialYearStart || ''
    };
    if (existing) {
      db.get('settings').find({ user_id: req.user.id }).assign(data).write();
    } else {
      db.get('settings').push({ id: uuidv4(), user_id: req.user.id, ...data }).write();
    }

    const row = db.get('settings').find({ user_id: req.user.id }).value();
    res.json(formatSettings(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/settings/subscription
router.get('/subscription', (req, res) => {
  try {
    const row = db.get('subscriptions').find({ user_id: req.user.id }).value();
    res.json(formatSubscription(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// PUT /api/settings/subscription
router.put('/subscription', (req, res) => {
  try {
    const { plan, price, usersAllowed } = req.body;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const expiryDate = expiry.toISOString().split('T')[0];

    const advancedReports = plan !== 'Starter Plan';
    const multiWarehouse = plan === 'Wholesaler Pro';
    const multiUser = true;

    const data = {
      plan,
      status: 'Active',
      price: Number(price) || 0,
      expiry_date: expiryDate,
      users_allowed: Number(usersAllowed) || 1,
      advanced_reports: advancedReports,
      multi_warehouse: multiWarehouse,
      ai_assistant: true,
      multi_user: multiUser
    };

    const existing = db.get('subscriptions').find({ user_id: req.user.id }).value();
    if (existing) {
      db.get('subscriptions').find({ user_id: req.user.id }).assign(data).write();
    } else {
      db.get('subscriptions').push({ id: uuidv4(), user_id: req.user.id, ...data }).write();
    }

    const row = db.get('subscriptions').find({ user_id: req.user.id }).value();
    res.json(formatSubscription(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

module.exports = router;

