/**
 * Bus Booking DTOs for Frontend
 */

export interface BusDTO {
  id: string;
  busNumber: string;
  busName: string | null;
  totalSeats: number;
  routeName: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusSeatDTO {
  id: string;
  seatNumber: string;
  seatType: "WINDOW" | "AISLE" | "MIDDLE" | null;
  isAvailable: boolean;
  busId: string;
  busNumber?: string;
}

export interface BusScheduleDTO {
  id: string;
  busId: string;
  busNumber?: string;
  className: string;
  departureTime: Date;
  arrivalTime: Date;
  pickupPoint: string | null;
  dropPoint: string | null;
  isActive: boolean;
}

export interface BusBookingDTO {
  id: string;
  studentId: string;
  studentName?: string;
  busId: string;
  busNumber?: string;
  seatId: string;
  seatNumber?: string;
  scheduleId: string | null;
  travelDate: Date;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
}

export interface BusAvailabilityDTO {
  bus: BusDTO;
  seats: BusSeatDTO[];
  availableSeats: BusSeatDTO[];
  occupiedSeats: number;
}
