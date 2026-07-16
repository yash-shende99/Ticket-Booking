# 🚄 RailConnect – Next-Gen Dynamic Railway Ticket Booking System

## 🚀 Overview

**RailConnect** is a robust, full-stack railway management platform built to solve the complexity of large-scale railway ticket booking. Built entirely on the modern Next.js 14 App Router architecture, it provides real-time dynamic pricing, live train tracking, and an automated Waitlist/RAC cascading engine without the need for a separate backend server.

The platform executes complex seat allocations, inventory deductions, and automatic Waitlist-to-Confirm promotions safely through strict Server Actions and typed MongoDB integrations, guaranteeing a reliable booking experience.

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)

---

## 📸 Visual Proof

*(Please place your actual screenshots inside a `ScreenShots/` folder and replace the URLs below!)*

### 🎫 Home Page & Smart Search
<img src="ScreenShots/home_search.jpg" alt="Home Search" width="800"/>

### 📊 Real-Time Train Tracking
<img src="ScreenShots/live_tracking.jpg" alt="Live Tracking" width="800"/>

### 💺 Admin Dashboard & Revenue Analytics
<img src="ScreenShots/admin_dashboard.jpg" alt="Admin Dashboard" width="800"/>

---

## ⚡ Key Highlights (For Busy Recruiters)

| Area | Achievement |
| :--- | :--- |
| **Performance** | Eliminates API overhead by utilizing direct Next.js Server Actions for deep database mutations. |
| **Reliability** | Sophisticated state-machine logic guarantees accurate cascading for Waitlist -> RAC -> Confirm promotions. |
| **Code Quality** | Strict TypeScript adherence across the entire stack. **0** `any` cast failures in production build. |
| **Architecture** | Monolith Next.js architecture decoupling UI components, Mongoose Models, and core business Engines. |
| **Security** | Session management secured by **NextAuth.js**, featuring role-based access for Users vs. Admins. |

---

## 🔗 Live Demo & Video

🔗 **Live Platform Demo:** [Insert Your Vercel/Netlify Link Here]
📹 **Video Walkthrough (3 mins):** [Insert Your YouTube/Lom Link Here]

---

## ✨ Core Features

### For Users 👤
- 🚆 **Real-time Seat Availability** – Check live inventory for any train with dynamic quotas.
- 📝 **Smart Booking Engine** – Automatically handles RAC (Reservation Against Cancellation), Waitlists, and Confirm bookings.
- 📍 **Live Train Tracking** – Calculate train speed, delays, and current locations on an interactive timeline.
- 📱 **Responsive Design** – Premium glassmorphism UI designed for both desktop and mobile platforms.

### For Admins 🔐
- 📊 **Global Analytics** – Visualize daily revenue, ticket cancellations, and top-performing routes.
- 🚂 **Train & Route Management** – Build complete geographical train routes with specific station halting times.
- 🎫 **Coupon & Offer Engine** – Create, validate, and track promotional codes applied by users.
- 📋 **Booking Oversight** – Complete control to view, refund, and manage individual user tickets.

---

## 🧠 Why this approach?

- **Why Next.js (App Router)?** Using Server Components and Server Actions eliminates the traditional Frontend-Backend split. It drastically reduces network waterfall latency and simplifies infrastructure deployment (everything runs on Vercel seamlessly).
- **Why MongoDB?** Railway schemas are highly relational but require rapid document traversal (Train -> Route -> Stations). MongoDB's nested population (`.populate()`) handles these deep queries much faster than complex SQL joins, which is crucial for a fast seat-availability check.

---

## 🏗️ Architecture & Tech Stack

### System Flow
```text
Client Request (Next.js UI) 
    ↓
Server Action (Validation & Auth via NextAuth)
    ↓
Availability Check (Inventory Engine: inventoryEngine.ts)
    ↓
Payment Simulation (Razorpay UI mock)
    ↓
Database Commit (Mongoose)
```

### Tech Stack Breakdown
| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Server Actions, NextAuth.js (Session) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Simulations** | Razorpay (Payments) |

---

## 🖥️ Quick Setup (The "5-Minute Rule")

**Prerequisites:** Node.js 18+ and a MongoDB connection string.

```bash
# 1. Clone the repository
git clone https://github.com/yash-shende99/Ticket-Booking.git
cd Ticket-Booking

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example contents into a new .env file
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/railconnect"
NEXTAUTH_SECRET="your_secure_random_string"

# 4. Seed realistic database (trains, routes, stations)
# This script injects realistic Indian Railway data into your MongoDB!
node scripts/seedRealisticData.ts

# 5. Spin up the development server
npm run dev
```
Open `http://localhost:3000` to start booking!

---

## 📝 Resume Sync (For Interviewers)

| Resume Bullet | Corresponding Code File |
| :--- | :--- |
| *"Designed automated Waitlist and RAC cascading engine"* | `lib/inventoryEngine.ts` |
| *"Integrated real-time train tracking and live timelines"* | `lib/liveEngine.ts` |
| *"Implemented secure role-based Admin dashboard"* | `app/admin/layout.tsx` |

---

<details> 
<summary><b>💬 Interview Q&A (Click to expand: Potential Interview Questions & Answers)</b></summary>

**Q: What was the hardest bug you fixed?**
A: Ensuring type-safety during deeply nested Mongoose `.populate()` calls during the strict Next.js production build (`npm run build`). When navigating arrays of nested documents (like `train.route.stations`), TypeScript threw implicit `any` errors that blocked deployment. I resolved this by applying explicit casting and strict interface boundaries at the Server Action layer.

**Q: Why Next.js Server Actions instead of a separate backend (like Express/NestJS)?**
A: Server Actions reduce API routing overhead, provide end-to-end type safety directly from database to UI, and allow seamless integration with React Server Components. For this scale, a monolith architecture was drastically more efficient.

**Q: What would you do differently with 1 more month?**
A: Implement a real-time WebSocket connection using `Socket.io` for the Live Train Status map so it updates instantly without the client needing to poll the server or refresh.

</details>

---

## 🎓 Acknowledgments

Built specifically for the **Unthinkable Solutions Technical Assessment**. 
Distributed under the MIT License.
