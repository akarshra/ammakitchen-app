# Amma Kitchen Salem (அம்மா கிச்சன்) 🍲

> Authentic, homely South Indian food delivery & subscription platform built with React Native (Expo Router) and a Node.js/PostgreSQL backend with real-time Socket.io delivery tracking and an operations CRM.

---

## 🌟 Overview

**Amma Kitchen Salem** brings traditional South Indian home-cooked meals to your doorstep in Salem, Tamil Nadu. Designed with love for authentic recipes, wholesome nutrition, and senior care, the app provides a seamless ordering experience from breakfast tiffins and traditional noon thalis to specialized senior meal plans and weekly subscriptions.

---

## ✨ Key Features

### 📱 Customer App (React Native / Expo)
- **Extensive Homely Menu**: Hand-crafted traditional breakfast combos, Salem special noon meals, evening snacks, dinner rotis/dosas, desserts, and traditional beverages.
- **Smart Dietary Filtering**: Filter easily by Pure Veg, Non-Veg, Dishes Under ₹150, Senior-Friendly dishes, and categories.
- **Elder Nutrition & Care Profiles**:
  - Dedicated profiles for elderly family members.
  - Custom dietary preferences (low salt, diabetic-friendly, mild spice, soft texture).
  - Assign specific dishes in a single cart to individual elder profiles.
- **Weekly Meal Planner**:
  - Scheduled daily lunch and dinner plans.
  - Easily swap dishes or skip delivery days with one click.
- **Amma Loyalty & Meal Donations**:
  - Earn Amma Points on every order.
  - Redeem points for discounts or donate meals to local hunger-relief initiatives.
- **Live Real-time Delivery Tracking**:
  - Live rider simulation on Salem map (from Fairlands kitchen to Hasthampatti / destination).
  - Real-time updates powered by Socket.io.
- **Modern Responsive UI**:
  - Works smoothly across iOS, Android, and Web browsers.
  - Smooth animations with React Native Reanimated, haptics, dietary badges, and quick-cart drawers.

### 🖥️ Kitchen & Dispatch Operations (CRM Dashboard)
- Web-based CRM interface hosted at `/crm`.
- Live real-time incoming orders view.
- Order lifecycle management (`Preparing`, `Ready`, `Out for Delivery`, `Delivered`).
- Rider dispatch with automatic live coordinate broadcasting.
- Menu management and coupon code administration.

---

## 🛠️ Tech Stack

### Frontend (Mobile & Web)
- **Framework**: [Expo 54](https://expo.dev/) with [React Native 0.81](https://reactnative.dev/)
- **Routing**: [Expo Router 6](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: TypeScript
- **State Management**: React Context (`AppContext`) with AsyncStorage persistence
- **Icons & Styling**: [Lucide React Native](https://lucide.dev/), React Native Reanimated, Linear Gradient
- **Networking & Realtime**: Fetch API + `socket.io-client`

### Backend & Database
- **Runtime**: Node.js & Express
- **Real-time Engine**: Socket.io
- **Database**: PostgreSQL (with automated schema migrations and seeding)
- **Architecture**: Modular REST API (`routes.js`), connection pooling (`pg`), and static CRM UI

---

## 📁 Project Structure

```text
├── app/                         # Expo Router screen routes
│   ├── (tabs)/                  # Bottom tab navigation
│   │   ├── index.tsx            # Home screen (Hero picks, categories, feed)
│   │   ├── explore.tsx          # Menu exploration & search
│   │   ├── orders.tsx           # Order history & live tracking
│   │   └── profile.tsx          # User profile, saved addresses, settings
│   ├── dish/[id].tsx            # Detailed dish customization & nutrition
│   ├── cart.tsx                 # Cart & elder profile dish assignment
│   ├── checkout.tsx             # Address & payment selection
│   ├── order-success.tsx        # Order confirmation celebration
│   ├── elder-profiles.tsx       # Elder care management
│   ├── meal-planner.tsx         # Weekly meal subscription & swaps
│   ├── loyalty-rewards.tsx      # Rewards & meal donation
│   ├── nutrition-dashboard.tsx  # Caloric and macronutrient insights
│   ├── admin.tsx                # Mobile admin view
│   ├── auth.tsx                 # Sign-in & registration
│   └── _layout.tsx              # Root app layout & providers
├── backend/                     # Express & PostgreSQL backend
│   ├── public/                  # Operations CRM frontend (HTML, CSS, JS)
│   ├── database.js              # PostgreSQL pool & automated migrations
│   ├── routes.js                # API endpoints
│   ├── server.js                # Express app & Socket.io server
│   └── .env                     # Backend environment configuration
├── components/                  # Reusable UI components
│   ├── FoodCard.tsx             # Food card with veg/non-veg indicator & add buttons
│   ├── RiderLiveTracker.tsx     # Real-time animated delivery tracker
│   ├── CategoryPills.tsx        # Horizontal category selector
│   ├── FloatingCartBar.tsx      # Bottom cart indicator
│   └── ...                      # Modals, banners, and stories
├── constants/                   # Colors, theme variables & assets
├── data/                        # Menu items and fallback seed data
├── metro.config.js              # Metro bundler config
└── package.json                 # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (running locally on port 5432)
- [Expo Go](https://expo.dev/go) app installed on your Android or iOS device (for mobile testing)

---

### 1. Database Setup
Ensure PostgreSQL is running locally:
```bash
# Example on macOS with Homebrew
brew services start postgresql
```
Create the database:
```sql
CREATE DATABASE amma_kitchen;
```

---

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Verify or edit your `.env` file:
   ```env
   PORT=3000
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=amma_kitchen
   PGUSER=postgres
   PGPASSWORD=your_password
   PGSSL=false
   ```
3. Install dependencies and start the backend:
   ```bash
   npm install
   npm start
   ```
   > The server will automatically connect to PostgreSQL, create the necessary tables, and seed the default menu items.
   - **Backend API**: `http://localhost:3000`
   - **Kitchen CRM**: `http://localhost:3000/crm`

---

### 3. Frontend App Setup
1. From the project root directory, install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

3. Launch on your target platform:
   - **Web**: Press `w` in terminal or open [http://localhost:8081](http://localhost:8081)
   - **Android**: Press `a` (or run in Android Emulator)
   - **iOS**: Press `i` (or run in iOS Simulator)
   - **Physical Device**: Scan the terminal QR code with **Expo Go** on Android or Camera on iOS.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Starts the Expo Metro bundler |
| `npm run web` | Starts Expo directly targeting the web browser |
| `npm run android` | Builds and runs the Android development build |
| `npm run ios` | Builds and runs the iOS development build |
| `cd backend && npm start` | Starts the backend Express + Socket.io server |
| `npx tsc --noEmit` | Runs TypeScript type checking across the project |

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
