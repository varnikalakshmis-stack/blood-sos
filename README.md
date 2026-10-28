# BloodLink SOS - Emergency Blood Donor & SOS Alert Directory (MERN)

Find matching blood donors in your neighbourhood or society network during emergencies.

## Features
- **Volunteer registration** by blood group and locality (JWT auth, bcrypt-hashed passwords)
- **Donor search** by blood group + locality, with optional "include compatible groups"
- **SOS broadcast board** - urgent requests ranked critical > urgent > normal, auto-refreshes every 15 s
- **Single-click contact** - Call / WhatsApp / SMS links (phone numbers masked for guests)
- **Availability toggle** - donors switch themselves on/off; 90-day post-donation eligibility flag
- **"I can donate"** responses, mark request fulfilled/cancelled, matching-requests list per donor

## Tech stack
MongoDB + Mongoose, Express, React 18 (Vite) + React Router, Node.js

## Prerequisites
Node.js 18+ and MongoDB running locally (or a MongoDB Atlas connection string).

## Setup
```bash
# 1. install everything
npm install
npm run install-all

# 2. configure the API
cp server/.env.example server/.env     # (Windows: copy server\.env.example server\.env)
#    edit JWT_SECRET, and MONGO_URI if not using local MongoDB

# 3. (optional) load demo data - all demo accounts use password "password123"
npm run seed

# 4. run API (http://localhost:5000) and web app (http://localhost:5173) together
npm run dev
```
Demo login after seeding: `arjun@demo.com` / `password123`

### Production
```bash
npm run build     # builds client/dist
npm start         # Express serves the API and the built React app on :5000
```

## API summary
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | - | Register volunteer |
| POST | /api/auth/login | - | Login |
| GET/PUT | /api/auth/me | yes | Profile |
| PATCH | /api/auth/me/availability | yes | Availability toggle |
| GET | /api/donors | optional | Search (bloodGroup, locality, city, available, compatible) |
| GET | /api/donors/stats | - | Available donors per blood group |
| GET | /api/sos | - | Public SOS board (status, bloodGroup, locality) |
| POST | /api/sos | yes | Broadcast SOS |
| GET | /api/sos/mine, /api/sos/matching | yes | My requests / requests I can help with |
| POST | /api/sos/:id/respond | yes | Toggle "I can donate" |
| PATCH | /api/sos/:id/status | owner | open / fulfilled / cancelled |
| DELETE | /api/sos/:id | owner | Delete request |

## Folder structure
```
blood-sos/
  server/   config/ models/ middleware/ routes/ server.js seed.js
  client/   src/ (components/, pages/, api.js, AuthContext.jsx, styles.css)
```
