const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    locality: { type: String, required: true, trim: true, maxlength: 120 }, // neighborhood / society
    city: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Date, default: null },
    role: { type: String, enum: ['volunteer', 'admin'], default: 'volunteer' },
  },
  { timestamps: true }
);

userSchema.index({ bloodGroup: 1, locality: 1, isAvailable: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Eligible to donate again 90 days after last donation
userSchema.virtual('eligible').get(function () {
  if (!this.lastDonationDate) return true;
  const days = (Date.now() - this.lastDonationDate.getTime()) / 86400000;
  return days >= 90;
});

userSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret.password; delete ret.id; return ret; } });

module.exports = mongoose.model('User', userSchema);
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;
