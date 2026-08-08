# Medibus Architecture Document

## 1. Tech Stack
- **Frontend / Fullstack Framework**: Next.js (React with App Router)
- **Styling**: Tailwind CSS
- **Icons & UI Enhancements**: Lucide React
- **Language**: TypeScript / JavaScript
- **Deployment**: Vercel

## 2. Data Model
- **Facility / Store Model**: Handles regional healthcare facilities (Hospitals, Clinics, Homeopathy centers) with names, types, physical addresses, map queries, and geographic coordinates ($\text{lat}, \text{lon}$).
- **Medicine / Inventory Model**: Tracks facility-specific stock levels, pricing in Indian Rupees ($\text{₹}$), pack sizes / tablet counts per purchase (e.g., strips, bottles, sachets), and expiry dates.
- **Appointment & Queue Model**: Manages patient details, chosen date/time dropdown slots, and a First-In, First-Out (FIFO) virtual queue tracking system.

## 3. System Design & Data Flow
- **Proximity & ETA Calculation**: Utilizes the Haversine distance formula combined with live user browser geolocation (or custom fallback locations) to compute real-time travel minutes to nearby facilities.
- **Client-State Architecture**: Employs React hooks (`useState`, `useEffect`) for instant filtering of facility inventories, interactive symptom checking, and real-time queue ticket updates.