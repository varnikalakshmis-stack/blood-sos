const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { CAN_RECEIVE_FROM, escapeRegex, cleanPhone } = require('../utils');

const router = express.Router();

// Optional auth: phone numbers are only revealed to signed-in volunteers
async function optionalAuth(req, _res, next) {
  try {
    const h = req.headers.authorization || '';
    if (h.startsWith('Bearer ')) {
      const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
      req.user = await User.findById(id);
    }
  } catch (_) { /* treat as guest */ }
  next();
}

const maskPhone = (p) => (p ? p.slice(0, 3) + '*'.repeat(Math.max(p.length - 5, 3)) + p.slice(-2) : '');

function shape(donor, signedIn) {
  const d = donor.toJSON();
  const phone = cleanPhone(d.phone);
  const out = {
    _id: d._id, name: d.name, bloodGroup: d.bloodGroup, locality: d.locality, city: d.city,
    isAvailable: d.isAvailable, eligible: d.eligible, lastDonationDate: d.lastDonationDate,
  };
  if (signedIn) {
    out.phone = d.phone;
    out.contact = {
      call: `tel:${phone}`,
      whatsapp: `https://wa.me/${phone.replace(/^\+/, '')}`,
      sms: `sms:${phone}`,
    };
  } else {
    out.phone = maskPhone(d.phone);
  }
  return out;
}

// GET /api/donors?bloodGroup=O-&locality=anna&city=&available=true&compatible=true
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bloodGroup, locality, city, available, compatible } = req.query;
    const q = {};
    if (bloodGroup) {
      q.bloodGroup = compatible === 'true' && CAN_RECEIVE_FROM[bloodGroup]
        ? { $in: CAN_RECEIVE_FROM[bloodGroup] }
        : bloodGroup;
    }
    if (locality) q.locality = new RegExp(escapeRegex(locality.trim()), 'i');
    if (city) q.city = new RegExp(escapeRegex(city.trim()), 'i');
    if (available !== 'false') q.isAvailable = true; // default: only available donors

    const donors = await User.find(q).sort({ isAvailable: -1, lastDonationDate: 1 }).limit(200);
    const signedIn = !!req.user;
    res.json({ count: donors.length, donors: donors.map((d) => shape(d, signedIn)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/donors/stats  - counts per blood group (available donors)
router.get('/stats', async (_req, res) => {
  const rows = await User.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const total = await User.countDocuments();
  res.json({ total, byGroup: rows.map((r) => ({ bloodGroup: r._id, count: r.count })) });
});

module.exports = router;
