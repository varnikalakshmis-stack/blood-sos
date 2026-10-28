// Demo data: npm run seed   (all demo accounts use password "password123")
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const SosRequest = require('./models/SosRequest');

const donors = [
  ['Arjun Kumar', 'arjun@demo.com', '9876500001', 'O+', 'Anna Nagar', 'Chennai'],
  ['Priya Sharma', 'priya@demo.com', '9876500002', 'A+', 'Anna Nagar', 'Chennai'],
  ['Mohammed Rafi', 'rafi@demo.com', '9876500003', 'B+', 'T Nagar', 'Chennai'],
  ['Divya Lakshmi', 'divya@demo.com', '9876500004', 'O-', 'Velachery', 'Chennai'],
  ['Karthik Raja', 'karthik@demo.com', '9876500005', 'AB+', 'Velachery', 'Chennai'],
  ['Sneha Iyer', 'sneha@demo.com', '9876500006', 'A-', 'Adyar', 'Chennai'],
  ['Vikram Singh', 'vikram@demo.com', '9876500007', 'B-', 'Anna Nagar', 'Chennai'],
  ['Meena Devi', 'meena@demo.com', '9876500008', 'O+', 'T Nagar', 'Chennai'],
];

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), SosRequest.deleteMany({})]);
  const users = [];
  for (const [name, email, phone, bloodGroup, locality, city] of donors) {
    users.push(await User.create({ name, email, phone, bloodGroup, locality, city, password: 'password123' }));
  }
  users[2].isAvailable = false; // one donor currently unavailable
  await users[2].save();

  await SosRequest.create([
    { requester: users[0]._id, patientName: 'Ramesh K', bloodGroup: 'O-', units: 2, urgency: 'critical',
      hospital: 'Apollo Hospital, Greams Road', locality: 'Anna Nagar', city: 'Chennai',
      contactName: users[0].name, contactPhone: users[0].phone, note: 'Emergency surgery tonight' },
    { requester: users[1]._id, patientName: 'Lakshmi P', bloodGroup: 'B+', units: 1, urgency: 'urgent',
      hospital: 'MIOT International', locality: 'Velachery', city: 'Chennai',
      contactName: users[1].name, contactPhone: users[1].phone, note: 'Needed by tomorrow morning' },
  ]);

  console.log('Seeded 8 donors + 2 SOS requests. Login: arjun@demo.com / password123');
  process.exit(0);
})();
