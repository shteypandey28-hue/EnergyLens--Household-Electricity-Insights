# EnergyLens — Household Electricity Insights Platform

EnergyLens is a production-ready SaaS application designed for Indian households to track electricity usage, view precise estimated bills based on state-wise tariffs, and forecast future consumption using smart statistical models. 

## 🚀 Features

- **Appliance-Level Tracking**: Add and monitor individual household appliances. See which devices contribute most to your energy bills using smart projections.
- **Smart Insights & Alerts Engine**: Receive automated, context-aware alerts (e.g. Budget Warnings, Warranty Expiration, High Consumption) driven by an intelligent background engine.
- **India-Specific Tariffs**: Automatically calculates bills based on dynamic slab rates structured across multiple Indian states.
- **Razorpay Integration**: Fully functional and secure payment gateway for upgrading to the Premium tier or purchasing extra appliance slots.
- **Forecasting Engine**: Predicts future month consumption and provides actionable recommendations to reduce power footprint.
- **Blazing Fast UX**: Built with modern global caching algorithms (stale-while-revalidate) mapping for zero-lag UI routing and fluid animations.
- **Dynamic Theming**: Premium responsive UI with system-aware Dark Mode built on Tailwind CSS, Framer Motion, and Recharts.

## 🛠️ Tech Stack

**Frontend Architecture**
- React 19 (Vite) & TypeScript
- Tailwind CSS v4 & Framer Motion for sleek aesthetics
- React Router SPA (Single Page Application)
- Recharts & Lucide React for data visualization and modern iconography

**Backend System**
- Node.js & Express.js API
- MongoDB Data Layer with Mongoose ORM
- JWT Authentication architecture & integrated Google OAuth support
- Razorpay Server SDK for checkout verification

**Deployment Infrastructure**
- Frontend deployment on **Vercel**
- Backend architecture hosted on **Render** (or generic cloud instances)

## 📦 Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB daemon (Running locally or via Atlas)
- Razorpay Test/Live API Keys (optional, for payment tracking module validation)

### 1. Clone & Install
```bash
# Clone repository
git clone <repository_url>
cd energylens

# Install Frontend Dependencies
cd frontend
npm install

# Install Backend Dependencies
cd ../backend
npm install
```

### 2. Configuration Profiles
Check the existing `.env` templates and instantiate environment variables:
- **Frontend** configuration requires variables like `VITE_API_URL` into `frontend/.env`
- **Backend** configuration requires keys for JWT, Razorpay, and DB config into `backend/.env`.

Default MongoDB URI mapping:
`MONGO_URI=mongodb://localhost:27017/energylens`

### 3. Run the Application
Run the frontend client and backend nodes concurrently:

**Terminal 1 (Backend Initialization):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client Execution):**
```bash
cd frontend
npm run dev
```

## 🧪 Testing User Flows

1. **Onboarding Pipeline**: Create an account and ensure you select the appropriate "State", as this dynamically hooks into the electricity rate estimator module.
2. **Dashboard Analytics**: Check the comprehensive dashboard which tracks usage across specific months contextually.
3. **Usage Generation**: Navigate to "Appliances" or "Usage" tabs and insert daily records to populate metrics chart history and enable smart insight alerts.
4. **Subscription Tier Tests**: Navigate to Settings > "Manage Subscription" to trigger the Razorpay modal for Premium upgrades or expanding physical appliance device allotments.
