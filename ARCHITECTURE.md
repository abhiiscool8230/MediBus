# Medibus Architecture Document

## 1. Project Evolution & Vision
- **Original Concept**: A streamlined medical facility search and inventory tracking application focused on regional accessibility.
- **Enhanced Features (Added)**: 
  - **AI-Integrated Audit System**: Custom agent logic to verify inventory and facility data integrity.
  - **Geo-ETA Optimization**: Custom skill utility for accurate, traffic-aware travel time estimations without external paid APIs.
  - **CI/CD Pipeline**: Fully automated build testing and deployment workflows for continuous project reliability.

## 2. Tech Stack
- **Frontend / Fullstack Framework**: Next.js (React with App Router)
- **Styling**: Tailwind CSS
- **Icons & UI Enhancements**: Lucide React
- **Language**: TypeScript / JavaScript
- **Deployment**: Vercel

## 3. Data Model
- **Facility Store**: Manages healthcare hubs (Hospitals, Clinics) with lat/lon coordinates.
- **Inventory Model**: Tracks specific stock levels, pricing in Indian Rupees (₹), and pack sizes.
- **Queue System**: Handles patient ticketing and FIFO virtual queue management.

## 4. System Design & Data Flow
- **Proximity Calculation**: Uses the Haversine distance formula to calculate travel minutes between users and facilities.
- **Client-State Management**: Employs React hooks (useState, useEffect) for real-time facility filtering, symptom checking, and queue ticket updates.