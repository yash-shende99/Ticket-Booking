<div align="center">
  <h1>🚆 RailConnect</h1>
  <p><strong>Next-Generation Railway Ticketing & Fleet Management Ecosystem</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Portal-Access_Now-10B981?style=for-the-badge&logo=vercel)](https://ticket-booking-ten-orpin.vercel.app)
  
  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![Razorpay](https://img.shields.io/badge/Razorpay-Payment-02042B?style=for-the-badge&logo=razorpay)
</div>

<br/>

<div align="justify">
  <b>RailConnect</b> is a highly scalable, real-time railway ticketing and fleet management platform engineered for maximum concurrency and operational efficiency. Designed to handle thousands of simultaneous booking requests, it features a stunning glassmorphism-inspired UI, instant PNR generation, dynamic train route mapping, and an extensive Admin Super-Dashboard. Whether it's processing payments via Razorpay, sending SMS alerts via Twilio, or managing live train tracking, RailConnect delivers a frictionless, beautiful experience for both passengers and administrators.
</div>

## 🚀 Live Demo & Environments

🌍 **Launch Application:** [ticket-booking-ten-orpin.vercel.app](https://ticket-booking-ten-orpin.vercel.app)

To experience the full system architecture, use the following pre-configured demo accounts:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| 🛡️ **System Admin** | `admin@irctc.co.in` | `admin123` | [Admin Login](https://ticket-booking-ten-orpin.vercel.app/admin/login) |
| 👤 **Passenger** | `hvdpvd4@gmail.com` | `123456` | [Public Portal](https://ticket-booking-ten-orpin.vercel.app) |

## ✨ Key Technical Achievements

🎟️ **Dynamic Route & Station Graph:** Supports complex multi-stop train routes with exact distance, halt duration, and day-offset tracking for precise schedule generation.

⚡ **Real-Time Booking Engine:** Prevents seat double-booking across different classes (1A, 2A, 3A, SL, CC) using atomic MongoDB transactions and calculates dynamic pricing based on distance.

🤖 **Automated Communication:** Fully integrated Twilio SMS and NodeMailer systems for instant PNR confirmations, trip reminders, and cancellation/refund alerts.

💳 **Automated Refund & Coupon System:** Built-in Razorpay checkout with custom promotional coupons and a streamlined admin-approval workflow for ticket cancellations and wallet refunds.

📊 **Super Admin Dashboard:** 11+ custom-built admin panels featuring high-performance pagination (Server & Client side) for managing Users, Trains, Routes, Revenue, Daily Bookings, and more.

## 1. System Architecture

<p align="justify">The platform operates on a modernized <b>Next.js 15 App Router</b> architecture, heavily utilizing React Server Components for SEO and fast initial loads, alongside interactive Client Components for complex states like search filters and seat selection.</p>

```mermaid
graph TD
    %% Core Client Layer
    subgraph Frontend Client Layer
        Passenger[Passenger UI - Next.js Client Components]
        AdminUI[Admin Dashboard - React 19 UI]
        State[React State & Hooks Pagination]
    end

    %% Edge Network
    CDN[Vercel Edge CDN & Static Assets]

    %% Authentication Middleware Layer
    subgraph Security & Auth
        NextAuth[NextAuth.js JWT Provider]
        Middleware[Edge Route Protection]
    end

    %% Core Application Server (Next.js 15)
    subgraph Serverless Application Layer
        RSC[React Server Components - SEO & Fast Load]
        API[Serverless API Routes & Server Actions]
        
        %% Internal Engines
        BookingEngine[Atomic Seat Allocation Engine]
        DistanceEngine[Dynamic Fare & Routing Calculator]
        RACEngine[RAC / Waitlist Progression Daemon]
        ReportingEngine[Server-Side Data Aggregation]
    end

    %% Database & Persistence
    subgraph Data Layer
        DB[(MongoDB Atlas - Mongoose ODM)]
        Indexes[TTL & Compound Indexes]
    end

    %% External Third-Party APIs
    subgraph 3rd Party Integrations
        Razorpay[Razorpay Payment Gateway]
        Twilio[Twilio SMS Services]
        Nodemailer[SMTP Email Provider]
    end

    %% Interaction Flow
    Passenger <-->|Interactive State| State
    Passenger -->|Search & Book| CDN
    AdminUI -->|Paginated Requests| CDN
    
    CDN -->|Validates Request| Middleware
    Middleware -->|Verifies Token| NextAuth
    Middleware -->|Authorized Requests| RSC
    Middleware -->|Authorized Requests| API

    %% Engine execution
    API -->|Validates Transaction| BookingEngine
    API -->|Calculates Fares| DistanceEngine
    API -->|Manages Cancellations| RACEngine
    RSC -->|Admin Dashboard Analytics| ReportingEngine

    %% Database Operations
    BookingEngine <-->|Atomic Locks / Transactions| DB
    DistanceEngine <-->|Graph Traversal| DB
    RACEngine <-->|Queue Shifts| DB
    ReportingEngine <-->|Aggregate Pipelines| DB
    DB --- Indexes

    %% Third Party Communications
    BookingEngine -->|Creates Orders| Razorpay
    BookingEngine -->|Dispatches Alerts| Twilio
    BookingEngine -->|Sends E-Tickets| Nodemailer
```

---

## 2. Database Schema Overview (ER Diagram)

<p align="justify">The database strictly enforces relational integrity within a NoSQL environment to track trains traversing across multiple stations.</p>

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    USER {
        ObjectId _id PK
        String name
        String email
        String password "Hashed"
        String role "user | admin"
    }

    STATION ||--o{ ROUTE_STATION : "contains"
    STATION {
        ObjectId _id PK
        String name
        String code "Unique"
        String city
        String state
        Number platforms
    }

    ROUTE ||--o{ ROUTE_STATION : "sequence_of"
    ROUTE {
        ObjectId _id PK
        String routeName
        ObjectId source FK
        ObjectId destination FK
    }

    ROUTE_STATION {
        ObjectId station FK
        Number distanceFromSource "in km"
        Number haltDuration "in mins"
        Number dayOffset "0, 1, 2"
    }

    ROUTE ||--o{ TRAIN : "assigned_to"
    TRAIN {
        ObjectId _id PK
        String trainNumber "Unique"
        String name
        ObjectId route FK
        String departureTime
        Array runningDays "0-6"
        Number basePricePerKm
        Boolean isActive
    }

    TRAIN ||--o{ TRAIN_COACH : "consists_of"
    TRAIN_COACH {
        String coachClass "1A|2A|3A|SL|CC|GN|EC|2S"
        Number capacity
    }

    TRAIN ||--o{ SEAT_INVENTORY : "schedules"
    ROUTE ||--o{ SEAT_INVENTORY : "limits"
    SEAT_INVENTORY {
        ObjectId _id PK
        ObjectId train FK
        ObjectId route FK
        Date journeyDate
        String coachClass
        Number totalSeats
        Number availableSeats
        Number racSeats
        Number wlSeats
        Number racCount
        Number wlCount
        Number baseFare
    }

    USER ||--o{ BOOKING : "makes"
    TRAIN ||--o{ BOOKING : "hosts"
    BOOKING {
        ObjectId _id PK
        String pnr "Unique"
        ObjectId userId FK
        ObjectId trainId FK
        String seatClass
        Number pricePaid
        Date journeyDate
        String status "CONFIRMED | CANCELLED"
        String paymentStatus "PENDING | SUCCESS"
        Object fareDetails
        String emergencyContact
    }

    BOOKING ||--o{ PASSENGER : "includes"
    PASSENGER {
        String name
        Number age
        String gender
        String berthPreference
        String allocatedCoach
        Number allocatedSeat
        String bookingStatus "CNF | RAC | WL"
        String currentStatus
        Number queuePosition
    }

    COUPON {
        ObjectId _id PK
        String code "Unique"
        Number discountPercentage
        Number maxDiscount
        Date validUntil
        Boolean isActive
    }

    NOTIFICATION {
        ObjectId _id PK
        String title
        String message
        String type "INFO | ALERT | PROMO"
        Boolean isActive
    }
```

---

## 3. Advanced Features Deep Dive

### High-Performance Admin Pagination 📄
To handle massive datasets (e.g., thousands of daily bookings), RailConnect uses a hybrid pagination strategy:
- **Server-Side Pagination:** Used for `Revenue` and `Daily Bookings`. Next.js Server Components parse the `?page=` URL parameter, query MongoDB with `.skip()` and `.limit()`, and stream the exact chunk to the client. This allows for deep-linking (bookmarking page 5) and zero client-side RAM bloat.
- **Client-Side Pagination:** Used for `Stations`, `Trains`, and `Coupons`. Data is fetched once and cached in React state, providing instant 0ms page transitions via array slicing for optimal UX.

### Smart Distance Pricing & Routing 🗺️
Unlike static pricing, RailConnect calculates fares dynamically. When an admin creates a `Route`, they define the distance (in km) between stops. When a user searches for a train between two intermediary stations, the Booking Engine calculates the exact distance differential and multiplies it by the selected Seat Class multiplier.

---

## 4. Setup & Local Development Guide

<details>
<summary><strong>🛠️ Click to expand setup instructions</strong></summary>

### Prerequisites
- Node.js 18+
- MongoDB instance (Atlas or local)
- Razorpay Test Credentials

### Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0..."
RAZORPAY_KEY_ID="rzp_test_***"
RAZORPAY_KEY_SECRET="***"

# Email Integration (nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# SMS Integration
TWILIO_ACCOUNT_SID="AC***"
TWILIO_AUTH_TOKEN="***"
TWILIO_PHONE_NUMBER="+1***"
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yash-shende99/Ticket-Booking.git
cd Ticket-Booking
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

</details>

---

## 📸 5. Application Gallery

<p align="justify">Explore the beautiful glassmorphism aesthetic and dense functionality of RailConnect.</p>

<div align="center">

### The Passenger Portal

| Search & Discover | Ticket Booking Flow |
| :---: | :---: |
| <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_.png" width="400"/> | <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_book_6a64a4206da257b0a0cd7d8c_class=1A&date=2026-07-27T11_57_31.184Z&source=6a64a4206da257b0a0cd7d6e&dest=6a64a4206da257b0a0cd7d6f.png" width="400"/> |
| *Homepage featuring dynamic search and announcements* | *Adding passengers and verifying dynamic fare calculations* |

| My Bookings | Payment History |
| :---: | :---: |
| <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_bookings.png" width="400"/> | <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_profile_payments.png" width="400"/> |
| *Managing upcoming and completed trips with interactive tabs* | *Detailed ledger of all Razorpay transactions & refunds* |

### The System Admin Dashboard

| Admin Authentication | Revenue Analytics |
| :---: | :---: |
| <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_admin_login.png" width="400"/> | <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_admin_revenue (1).png" width="400"/> |
| *Secure login portal for system administrators* | *Server-side paginated breakdown of train performance* |

| Live Booking Management | Route Configuration |
| :---: | :---: |
| <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_admin_login (8).png" width="400"/> | <img src="website_screenshots/ticket-booking-ten-orpin.vercel.app_admin_login (3).png" width="400"/> |
| *Monitoring thousands of live tickets with instant search* | *Building complex multi-station routes with precise distance mapping* |

</div>

<br/>
<p align="center"><b>Engineered for Scale • Built with ❤️ by Yash Shende</b></p>
