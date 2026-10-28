const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { signToken } = require('../utils');

const router = express.Router();

// POST /api/auth/register  - volunteer registration (blood group + locality)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, locality, city, lastDonationDate } = req.body;
    if (!name || !email || !password || !phone || !bloodGroup || !locality) {
      return res.status(400).json({ message: 'Name, email, password, phone, blood group and locality are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      name, email, password, phone, bloodGroup, locality, city,
      lastDonationDate: lastDonationDate || null,
    });
    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    user.password = undefined;
    res.json({ token: signToken(user._id), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// PUT /api/auth/me  - update profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'bloodGroup', 'locality', 'city', 'lastDonationDate'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/me/availability  - availability toggle
router.patch('/me/availability', protect, async (req, res) => {
  const next = typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : !req.user.isAvailable;
  req.user.isAvailable = next;
  await req.user.save();
  res.json({ user: req.user });
});

module.exports = router;
