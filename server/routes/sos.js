const express = require('express');
const SosRequest = require('../models/SosRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { escapeRegex, CAN_RECEIVE_FROM, cleanPhone } = require('../utils');

const router = express.Router();

const URGENCY_ORDER = { critical: 0, urgent: 1, normal: 2 };

function withLinks(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const phone = cleanPhone(o.contactPhone);
  o.contact = {
    call: `tel:${phone}`,
    whatsapp: `https://wa.me/${phone.replace(/^\+/, '')}`,
    sms: `sms:${phone}`,
  };
  o.responderCount = (o.responders || []).length;
  return o;
}

// GET /api/sos?status=open&bloodGroup=O-&locality=anna  - public broadcast board
router.get('/', async (req, res) => {
  try {
    const { status = 'open', bloodGroup, locality, city } = req.query;
    const q = {};
    if (status !== 'all') q.status = status;
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (locality) q.locality = new RegExp(escapeRegex(locality.trim()), 'i');
    if (city) q.city = new RegExp(escapeRegex(city.trim()), 'i');

    const items = await SosRequest.find(q).populate('requester', 'name').sort({ createdAt: -1 }).limit(100);
    const list = items.map(withLinks).sort(
      (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ count: list.length, requests: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sos/mine
router.get('/mine', protect, async (req, res) => {
  const items = await SosRequest.find({ requester: req.user._id }).sort({ createdAt: -1 });
  res.json({ requests: items.map(withLinks) });
});

// GET /api/sos/matching - open SOS requests this donor can help with
router.get('/matching', protect, async (req, res) => {
  const receivers = Object.keys(CAN_RECEIVE_FROM).filter((rg) => CAN_RECEIVE_FROM[rg].includes(req.user.bloodGroup));
  const items = await SosRequest.find({ status: 'open', bloodGroup: { $in: receivers } })
    .populate('requester', 'name').sort({ createdAt: -1 }).limit(50);
  res.json({ requests: items.map(withLinks) });
});

// POST /api/sos - broadcast a new SOS request
router.post('/', protect, async (req, res) => {
  try {
    const { patientName, bloodGroup, units, urgency, hospital, locality, city, contactName, contactPhone, note, neededBy } = req.body;
    const sos = await SosRequest.create({
      requester: req.user._id,
      patientName, bloodGroup, units, urgency, hospital, locality, city,
      contactName: contactName || req.user.name,
      contactPhone: contactPhone || req.user.phone,
      note, neededBy: neededBy || null,
    });

    // How many available, compatible donors are in that locality right now
    const matchingDonors = await User.countDocuments({
      isAvailable: true,
      bloodGroup: { $in: CAN_RECEIVE_FROM[bloodGroup] || [bloodGroup] },
      locality: new RegExp(escapeRegex(locality), 'i'),
    });
    res.status(201).json({ request: withLinks(sos), matchingDonors });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/sos/:id/respond - toggle "I can help"
router.post('/:id/respond', protect, async (req, res) => {
  const sos = await SosRequest.findById(req.params.id);
  if (!sos) return res.status(404).json({ message: 'Request not found' });
  const i = sos.responders.findIndex((u) => u.equals(req.user._id));
  if (i >= 0) sos.responders.splice(i, 1); else sos.responders.push(req.user._id);
  await sos.save();
  res.json({ request: withLinks(sos), responding: i < 0 });
});

// PATCH /api/sos/:id/status - requester marks fulfilled / cancelled
router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  if (!['open', 'fulfilled', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const sos = await SosRequest.findById(req.params.id);
  if (!sos) return res.status(404).json({ message: 'Request not found' });
  if (!sos.requester.equals(req.user._id)) return res.status(403).json({ message: 'Only the requester can change this' });
  sos.status = status;
  await sos.save();
  res.json({ request: withLinks(sos) });
});

// DELETE /api/sos/:id
router.delete('/:id', protect, async (req, res) => {
  const sos = await SosRequest.findById(req.params.id);
  if (!sos) return res.status(404).json({ message: 'Request not found' });
  if (!sos.requester.equals(req.user._id)) return res.status(403).json({ message: 'Only the requester can delete this' });
  await sos.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
