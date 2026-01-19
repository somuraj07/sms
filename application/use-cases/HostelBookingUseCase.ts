import { IHostelRepository } from "@/domain/repositories/IHostelRepository";
import { HostelRoom, HostelCot, HostelBooking } from "@/domain/entities/Hostel.entity";
import prisma from "@/lib/db";

export interface CreateHostelRoomRequest {
  name: string;
  capacity: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  schoolId: string;
}

export interface BookHostelCotRequest {
  studentId: string;
  roomId: string;
  cotId: string;
  checkInDate: Date;
}

export class HostelBookingUseCase {
  constructor(private readonly hostelRepository: IHostelRepository) {}

  async createRoom(request: CreateHostelRoomRequest): Promise<HostelRoom> {
    // Validate capacity
    if (request.capacity <= 0) {
      throw new Error("Room capacity must be greater than 0");
    }

    const room = await this.hostelRepository.createRoom({
      name: request.name,
      capacity: request.capacity,
      gender: request.gender,
      schoolId: request.schoolId,
    });

    // Create cots for the room
    for (let i = 1; i <= request.capacity; i++) {
      await this.hostelRepository.createCot({
        cotNumber: i.toString(),
        roomId: room.id,
      });
    }

    return room;
  }

  async bookCot(request: BookHostelCotRequest): Promise<HostelBooking> {
    // Check if student already has an active booking
    const activeBooking = await this.hostelRepository.findActiveBookingByStudent(request.studentId);
    if (activeBooking) {
      throw new Error("Student already has an active hostel booking");
    }

    // Get student to check gender
    const student = await prisma.student.findUnique({
      where: { userId: request.studentId },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Get room and validate gender match
    const room = await this.hostelRepository.findRoomById(request.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (!room.canAccommodateGender(student.gender)) {
      throw new Error("Room gender does not match student gender");
    }

    // Get cot and validate availability
    const cot = await this.hostelRepository.findCotById(request.cotId);
    if (!cot) {
      throw new Error("Cot not found");
    }

    if (!cot.canBeBooked()) {
      throw new Error("Cot is not available");
    }

    if (cot.roomId !== request.roomId) {
      throw new Error("Cot does not belong to the specified room");
    }

    // Create booking
    const booking = await this.hostelRepository.createBooking({
      studentId: request.studentId,
      roomId: request.roomId,
      cotId: request.cotId,
      checkInDate: request.checkInDate,
    });

    return booking;
  }

  async getAvailableRooms(schoolId: string, gender: "MALE" | "FEMALE" | "OTHER"): Promise<HostelRoom[]> {
    return this.hostelRepository.findRoomsBySchool(schoolId, gender);
  }

  async getRoomAvailability(roomId: string): Promise<{
    room: HostelRoom;
    totalCots: number;
    availableCots: HostelCot[];
    occupiedCots: number;
  }> {
    const room = await this.hostelRepository.findRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const allCots = await this.hostelRepository.findCotsByRoom(roomId);
    const availableCots = await this.hostelRepository.findAvailableCots(roomId);

    return {
      room,
      totalCots: allCots.length,
      availableCots,
      occupiedCots: allCots.length - availableCots.length,
    };
  }

  async cancelBooking(bookingId: string): Promise<HostelBooking> {
    const booking = await this.hostelRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.canBeCancelled()) {
      throw new Error("Booking cannot be cancelled");
    }

    return this.hostelRepository.updateBookingStatus(bookingId, "CANCELLED");
  }
}
