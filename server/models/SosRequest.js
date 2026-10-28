const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true, trim: true, maxlength: 80 },
    bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    units: { type: Number, required: true, min: 1, max: 20, default: 1 },
    urgency: { type: String, enum: ['critical', 'urgent', 'normal'], default: 'urgent' },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    locality: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, trim: true, default: '' },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    note: { type: String, trim: true, maxlength: 400, default: '' },
    status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
    responders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // donors who tapped "I can help"
    neededBy: { type: Date, default: null },
  },
  { timestamps: true }
);

sosSchema.index({ status: 1, createdAt: -1 });
sosSchema.index({ bloodGroup: 1, locality: 1 });

module.exports = mongoose.model('SosRequest', sosSchema);
