import { HostelRoom, HostelCot, HostelBooking, Gender } from "../entities/Hostel.entity";

export interface CreateHostelRoomData {
  name: string;
  capacity: number;
  gender: Gender;
  schoolId: string;
}

export interface CreateHostelCotData {
  cotNumber: string;
  roomId: string;
}

export interface CreateHostelBookingData {
  studentId: string;
  roomId: string;
  cotId: string;
  checkInDate: Date;
}

export interface IHostelRepository {
  // Room operations
  createRoom(data: CreateHostelRoomData): Promise<HostelRoom>;
  findRoomById(id: string): Promise<HostelRoom | null>;
  findRoomsBySchool(schoolId: string, gender?: Gender): Promise<HostelRoom[]>;
  updateRoom(id: string, data: Partial<CreateHostelRoomData>): Promise<HostelRoom>;
  
  // Cot operations
  createCot(data: CreateHostelCotData): Promise<HostelCot>;
  findCotById(id: string): Promise<HostelCot | null>;
  findCotsByRoom(roomId: string): Promise<HostelCot[]>;
  findAvailableCots(roomId: string): Promise<HostelCot[]>;
  updateCotAvailability(cotId: string, isAvailable: boolean): Promise<HostelCot>;
  
  // Booking operations
  createBooking(data: CreateHostelBookingData): Promise<HostelBooking>;
  findBookingById(id: string): Promise<HostelBooking | null>;
  findBookingsByStudent(studentId: string): Promise<HostelBooking[]>;
  findBookingsByRoom(roomId: string): Promise<HostelBooking[]>;
  updateBookingStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED"): Promise<HostelBooking>;
  findActiveBookingByStudent(studentId: string): Promise<HostelBooking | null>;
}
