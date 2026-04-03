# ⛳ Golf Charity Subscription Platform

A full-stack MERN application combining golf performance tracking, monthly prize draws, and charity fundraising.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)

---

## 🔧 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
mkdir -p uploads/proofs
npm run seed     # Seed database with sample data
npm run dev      # Start dev server on :5000
```

### Backend `.env` values:
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 32+ char secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe price ID for monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Stripe price ID for yearly plan |
| `CLIENT_URL` | Frontend URL (e.g. http://localhost:5173) |

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev      # Start dev server on :5173
```

### Frontend `.env` values:
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. http://localhost:5000/api) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

---

## 🧪 Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@golfcharity.com | Admin@123456 |
| Subscriber | john@test.com | Test@123456 |

> **Dev mode**: In development, clicking "Subscribe" on the subscribe page uses `manual-activate` instead of Stripe, so you don't need real payment details to test.

---

## 📦 Deployment

### Backend → Render / Railway
1. Create new Web Service
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from `.env`

### Frontend → Vercel
1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Add `VITE_API_URL` pointing to your deployed backend
4. Deploy

### MongoDB → Atlas
1. Create a free M0 cluster
2. Whitelist `0.0.0.0/0` (or specific IPs)
3. Get connection string and add to backend `.env`

---

## 🏗️ Architecture

```
golf-charity-platform/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Seed script
│   └── server.js        # Express app
│
└── frontend/
    └── src/
        ├── components/   # Reusable UI
        │   └── layout/   # Navbar, Footer, Layouts
        ├── context/      # Auth context
        ├── pages/        # Route pages
        │   ├── admin/    # Admin panel
        │   ├── auth/     # Login/Register
        │   └── dashboard/ # User dashboard
        ├── services/     # API calls
        └── styles/       # Global CSS
```

---

## ✅ Feature Checklist

- [x] User signup & login (JWT)
- [x] Subscription flow (monthly & yearly via Stripe)
- [x] Score entry — 5-score rolling logic (1–45 Stableford)
- [x] Draw system — random & algorithmic engines
- [x] Draw simulation before publish
- [x] Jackpot rollover (5-match unclaimed)
- [x] Prize pool auto-calculation (40/35/25 split)
- [x] Charity selection & contribution percentage
- [x] Winner verification flow & proof upload
- [x] Payout tracking (pending → verified → paid)
- [x] User Dashboard — all modules functional
- [x] Admin Panel — full control & analytics
- [x] Responsive design (mobile-first)
- [x] Error handling & edge cases

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Stripe, Multer  
**Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Recharts, React Router v6  
**Deployment:** Vercel (frontend), Render/Railway (backend), MongoDB Atlas

---

Built for Digital Heroes Full Stack Developer Selection Process · March 2026
