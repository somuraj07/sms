/**
 * Hostel Booking DTOs for Frontend
 */

export interface HostelRoomDTO {
  id: string;
  name: string;
  capacity: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  totalCots: number;
  availableCots: number;
  occupiedCots: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HostelCotDTO {
  id: string;
  cotNumber: string;
  isAvailable: boolean;
  roomId: string;
  roomName?: string;
}

export interface HostelBookingDTO {
  id: string;
  studentId: string;
  studentName?: string;
  roomId: string;
  roomName?: string;
  cotId: string;
  cotNumber?: string;
  checkInDate: Date;
  checkOutDate: Date | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
}

export interface RoomAvailabilityDTO {
  room: HostelRoomDTO;
  cots: HostelCotDTO[];
  availableCots: HostelCotDTO[];
  occupiedCots: HostelCotDTO[];
}
