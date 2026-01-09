# Hostel & Bus Booking System - Implementation Summary

## Overview
This is a comprehensive hostel and bus booking system for engineering colleges, built with clean architecture principles and multi-tenant support.

## Features Implemented

### 1. Hostel Booking System
- **Admin Features:**
  - Create hostel rooms with capacity and gender segregation
  - View room availability
  - Manage room bookings

- **Student Features:**
  - View available rooms (filtered by gender)
  - Book cots in rooms (seat-style selection UI)
  - View booking history

- **API Routes:**
  - `POST /api/hostel/rooms/create` - Create hostel room
  - `GET /api/hostel/rooms/list` - List available rooms
  - `POST /api/hostel/book` - Book a cot
  - `GET /api/hostel/availability/[roomId]` - Get room availability

### 2. Bus Booking System
- **Admin Features:**
  - Create buses with seats
  - Create bus schedules for different classes
  - View bus availability

- **Student Features:**
  - View bus schedules by class
  - Book bus seats
  - View booking history

- **API Routes:**
  - `POST /api/bus/create` - Create bus
  - `POST /api/bus/schedule/create` - Create bus schedule
  - `POST /api/bus/book` - Book bus seat
  - `GET /api/bus/availability/[busId]` - Get bus availability

### 3. Examination Room Allocation System
- **Examiner Features:**
  - Create exam rooms with capacity
  - Create exam schedules (Semester, Mid-term, Final, Unit Test)
  - Allocate students to rooms and benches
  - Configure students per bench (1 for semester, 2 for mid-term)
  - Assign invigilators (teachers)
  - Generate PDF reports (department-wise allocation)

- **API Routes:**
  - `POST /api/exam/rooms/create` - Create exam room
  - `POST /api/exam/schedule/create` - Create exam schedule
  - `POST /api/exam/allocate` - Allocate students
  - `GET /api/exam/pdf/[scheduleId]` - Download allocation PDF

### 4. Multi-Tenant Architecture
- **Subdomain Support:**
  - Format: `college-name.company.com`
  - Middleware automatically resolves subdomain to school
  - Each college has isolated data

- **Implementation:**
  - Middleware extracts subdomain from hostname
  - API route `/api/school/resolve-subdomain` resolves school
  - School model includes `subdomain` field

## Architecture

### Clean Architecture Layers

1. **Domain Layer** (`domain/`)
   - Entities: Pure business logic
   - Repository Interfaces: Contracts for data access
   - Domain Services: Business rules

2. **Application Layer** (`application/`)
   - Use Cases: Application-specific business logic
   - DTOs: Data transfer objects

3. **Infrastructure Layer** (`infrastructure/`)
   - Repository Implementations: Prisma-based data access
   - External Services: Third-party integrations

4. **Presentation Layer** (`app/`)
   - API Routes: Next.js API handlers
   - Pages: React components

## Database Schema Updates

### New Models Added:
- `HostelRoom` - Hostel rooms with gender segregation
- `HostelCot` - Individual cots in rooms
- `HostelBooking` - Student bookings
- `Bus` - Bus information
- `BusSeat` - Individual seats
- `BusSchedule` - Bus timetables
- `BusBooking` - Student bus bookings
- `ExamRoom` - Examination rooms
- `ExamSchedule` - Exam schedules
- `ExamAllocation` - Student-room allocations

### Updated Models:
- `School` - Added `subdomain` and `isActive` fields
- `Student` - Added `gender` field

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npx prisma migrate dev --name add_hostel_bus_exam_features
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Configure Environment
Ensure your `.env` file has:
```
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run Development Server
```bash
npm run dev
```

## Usage Examples

### Creating a Hostel Room (Admin)
```typescript
POST /api/hostel/rooms/create
{
  "name": "Room 101",
  "capacity": 4,
  "gender": "MALE"
}
```

### Booking a Cot (Student)
```typescript
POST /api/hostel/book
{
  "roomId": "room_id",
  "cotId": "cot_id",
  "checkInDate": "2024-01-15"
}
```

### Creating Exam Schedule (Examiner)
```typescript
POST /api/exam/schedule/create
{
  "examType": "MID_TERM",
  "examName": "Mid Term 2024",
  "subject": "Mathematics",
  "department": "CSE",
  "roomId": "room_id",
  "examDate": "2024-02-15",
  "startTime": "2024-02-15T09:00:00Z",
  "endTime": "2024-02-15T12:00:00Z",
  "studentsPerBench": 2
}
```

## Next Steps (Frontend Implementation)

1. **Hostel Booking UI:**
   - Seat-style cot selection interface
   - Room visualization
   - Gender filtering

2. **Bus Booking UI:**
   - Seat map visualization
   - Timetable display
   - Route selection

3. **Exam Allocation UI:**
   - Room allocation interface
   - PDF download button
   - Department-wise filtering

4. **Student Portal:**
   - Dashboard with all bookings
   - Booking history
   - Profile management

5. **Parent Portal:**
   - View child's bookings
   - Notifications
   - Payment tracking

## Notes

- PDF generation is currently returning JSON. For production, implement with a proper PDF library (puppeteer, jsPDF, or PDFKit with proper setup)
- Subdomain routing works in production. For local development, use `college-name.localhost:3000`
- All API routes require authentication via NextAuth
- Gender-based room allocation is enforced at the domain level
