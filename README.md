# EnergyLens — Household Electricity Insights Platform

EnergyLens is a production-ready SaaS application designed for Indian households to track electricity usage, estimated bills based on state-wise tariffs, and forecast future consumption using AI/statistical models.

## 🚀 Features

- **Appliance-Level Tracking**: Monitor usage of individual appliances.
- **India-Specific Billing**: Calculates bills based on slab rates for Delhi, Maharashtra, Karnataka, etc.
- **Forecasting Engine**: Predicts future consumption and costs.
- **Premium Subscription**: Gate advanced features behind a paywall (Mock Payment).
- **Responsive Dashboard**: Premium UI built with React, Tailwind, and Recharts.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Auth**: JWT Authentication.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. clone & Install
```bash
# Install Frontend Dependencies
cd frontend
npm install

# Install Backend Dependencies
cd ../backend
npm install
```

### 2. Configuration
The project comes with default configuration.
- Frontend runs on `http://localhost:5175`
- Backend runs on `http://localhost:5001`
- MongoDB URI: `mongodb://localhost:27017/energylens` (Change in `backend/.env` if needed)

### 3. Run Application
You can run both frontend and backend:

**Terminal 1 (Backend):**
```bash
cd backend
npx nodemon src/index.ts
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 🧪 Testing

1. **Sign Up**: Create a new account. Select your State (e.g., Delhi, Maharashtra).
2. **Dashboard**: View your empty dashboard.
3. **Add Usage**: Go to "Usage & Bills" and add a manual reading (Date + kWh). Add multiple days to see trends.
4. **Forecast**: Upgrade to Premium to see the Forecast (requires at least 2 readings).
5. **Upgrade**: Go to "Upgrade" page and click "Upgrade Now" to simulate payment.
