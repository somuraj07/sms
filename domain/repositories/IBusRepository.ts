import { Bus, BusSeat, BusSchedule, BusBooking } from "../entities/Bus.entity";

export interface CreateBusData {
  busNumber: string;
  busName: string | null;
  totalSeats: number;
  routeName: string;
  schoolId: string;
}

export interface CreateBusSeatData {
  seatNumber: string;
  seatType: "WINDOW" | "AISLE" | "MIDDLE" | null;
  busId: string;
}

export interface CreateBusScheduleData {
  busId: string;
  className: string;
  departureTime: Date;
  arrivalTime: Date;
  pickupPoint: string | null;
  dropPoint: string | null;
}

export interface CreateBusBookingData {
  studentId: string;
  busId: string;
  seatId: string;
  scheduleId: string | null;
  travelDate: Date;
}

export interface IBusRepository {
  // Bus operations
  createBus(data: CreateBusData): Promise<Bus>;
  findBusById(id: string): Promise<Bus | null>;
  findBusesBySchool(schoolId: string): Promise<Bus[]>;
  updateBus(id: string, data: Partial<CreateBusData>): Promise<Bus>;
  
  // Seat operations
  createSeat(data: CreateBusSeatData): Promise<BusSeat>;
  findSeatById(id: string): Promise<BusSeat | null>;
  findSeatsByBus(busId: string): Promise<BusSeat[]>;
  findAvailableSeats(busId: string): Promise<BusSeat[]>;
  updateSeatAvailability(seatId: string, isAvailable: boolean): Promise<BusSeat>;
  
  // Schedule operations
  createSchedule(data: CreateBusScheduleData): Promise<BusSchedule>;
  findScheduleById(id: string): Promise<BusSchedule | null>;
  findSchedulesByBus(busId: string): Promise<BusSchedule[]>;
  findSchedulesByClass(className: string, schoolId: string): Promise<BusSchedule[]>;
  updateSchedule(id: string, data: Partial<CreateBusScheduleData>): Promise<BusSchedule>;
  
  // Booking operations
  createBooking(data: CreateBusBookingData): Promise<BusBooking>;
  findBookingById(id: string): Promise<BusBooking | null>;
  findBookingsByStudent(studentId: string): Promise<BusBooking[]>;
  findBookingsByBus(busId: string, travelDate?: Date): Promise<BusBooking[]>;
  updateBookingStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED"): Promise<BusBooking>;
}
