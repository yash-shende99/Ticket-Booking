# RailConnect - Ticket Booking Application

A full-stack railway ticket booking application built as part of the Unthinkable Solutions Technical Assessment.

## Project Approach (Brief Write-up)

This application was designed to solve the complexity of railway ticket booking while providing a modern, premium user experience. I chose a **Next.js (App Router)** architecture because it enables a seamless full-stack setup within a single repository—minimizing dependencies and ensuring clean, production-ready code. 

For the data layer, I integrated **MongoDB (with Mongoose)** to efficiently model the relationships between trains, varying seat classes, and passenger bookings. This aligns with modern NoSQL scalability. For styling, I used **Tailwind CSS** to rapidly implement a responsive, visually appealing interface (glassmorphism, skeleton loading states) without cluttering the project with massive external component libraries. 

Key features include an interactive train discovery dashboard, real-time pricing calculations based on seat tier selection (1AC, 2AC, Sleeper), and a server-action-driven booking flow that automatically generates unique PNR numbers. Error handling and loading states are implemented throughout the application to ensure a robust user experience. The code is modular, type-safe, and designed for easy maintainability.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB
- **ORM:** Mongoose

## How to Run Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file:
   ```env
   MONGODB_URI="your_mongodb_connection_string"
   ```
4. (Optional) Seed the database with sample trains:
   ```bash
   npx tsx seed.ts
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Train Discovery:** View available trains with source, destination, and timings.
- **Seat Class Selection:** Dynamically view prices for different tiers (1AC, 2AC, etc.).
- **Booking System:** Enter passenger details and generate a unique PNR.
- **My Bookings:** Track and view all your confirmed tickets.
