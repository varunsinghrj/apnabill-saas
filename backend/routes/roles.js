const express = require('express');
const { db, formatRole } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/roles
router.get('/', (req, res) => {
  try {
    const rows = db.get('roles').filter({ user_id: req.user.id }).value() || [];
    // Sort desc by created_at
    const sorted = [...rows].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(sorted.map(formatRole));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/roles — Add team member
router.post('/', (req, res) => {
  try {
    const { name, email, role } = req.body;
    const id = `r${Date.now()}`;
    const row = {
      id,
      user_id: req.user.id,
      name,
      email: email || '',
      role: role || '',
      active: true,
      created_at: new Date().toISOString()
    };
    db.get('roles').push(row).write();

    res.status(201).json(formatRole(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// DELETE /api/roles/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.get('roles').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!existing) return res.status(404).json({ error: 'Team member not found' });
    
    db.get('roles').remove({ id: req.params.id, user_id: req.user.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// PATCH /api/roles/:id/toggle — Toggle active status
router.patch('/:id/toggle', (req, res) => {
  try {
    const current = db.get('roles').find({ id: req.params.id, user_id: req.user.id }).value();
    if (!current) return res.status(404).json({ error: 'Team member not found' });

    db.get('roles').find({ id: req.params.id, user_id: req.user.id }).assign({ active: !current.active }).write();
    
    const row = db.get('roles').find({ id: req.params.id, user_id: req.user.id }).value();
    res.json(formatRole(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

module.exports = router;

