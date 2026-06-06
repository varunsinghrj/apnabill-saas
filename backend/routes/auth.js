const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, uuidv4, seedDemoData, formatSettings } = require('../database');
const { authenticateToken } = require('../middleware/auth');

require('dotenv').config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'apnabill_secret';

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = db.get('users').find({ email }).value();
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    db.get('users').push({ id: userId, name, email, password_hash: passwordHash, business_name: businessName || '', created_at: now }).write();

    // Create empty settings + subscription
    db.get('settings').push({ id: uuidv4(), user_id: userId, business_name: businessName || '', gstin: '', gst_type: 'Regular', contact_no: '', email, address: '', currency: 'INR', financial_year_start: '' }).write();
    db.get('subscriptions').push({ id: uuidv4(), user_id: userId, plan: 'None', status: 'Pending Payment', price: 0, expiry_date: '', trial_ends: '', users_allowed: 0, advanced_reports: false, multi_warehouse: false, ai_assistant: false, multi_user: false }).write();

    const token = jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: userId, name, email, businessName: businessName || '', loggedIn: true } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = db.get('users').find({ email }).value();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, businessName: user.business_name, loggedIn: true } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/onboard
router.post('/onboard', authenticateToken, (req, res) => {
  try {
    const { businessName, gstin, gstType, contactNo, email, address, currency, financialYearStart } = req.body;
    const userId = req.user.id;

    const existing = db.get('settings').find({ user_id: userId }).value();
    if (existing) {
      db.get('settings').find({ user_id: userId }).assign({ business_name: businessName || '', gstin: gstin || '', gst_type: gstType || 'Regular', contact_no: contactNo || '', email: email || req.user.email, address: address || '', currency: currency || 'INR', financial_year_start: financialYearStart || '' }).write();
    } else {
      db.get('settings').push({ id: uuidv4(), user_id: userId, business_name: businessName || '', gstin: gstin || '', gst_type: gstType || 'Regular', contact_no: contactNo || '', email: email || req.user.email, address: address || '', currency: currency || 'INR', financial_year_start: financialYearStart || '' }).write();
    }
    db.get('users').find({ id: userId }).assign({ business_name: businessName || '' }).write();

    const settings = db.get('settings').find({ user_id: userId }).value();
    res.json({ settings: formatSettings(settings) });
  } catch (err) {
    console.error('Onboard error:', err);
    res.status(500).json({ error: 'Server error during onboarding' });
  }
});

// POST /api/auth/demo — Load demo data for logged-in user
router.post('/demo', authenticateToken, (req, res) => {
  try {
    seedDemoData(req.user.id);
    res.json({ success: true, message: 'Demo data loaded successfully' });
  } catch (err) {
    console.error('Demo seed error:', err);
    res.status(500).json({ error: 'Failed to load demo data' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, businessName: user.business_name, loggedIn: true } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
