import { IHostelRepository, CreateHostelRoomData, CreateHostelCotData, CreateHostelBookingData } from "@/domain/repositories/IHostelRepository";
import { HostelRoom, HostelCot, HostelBooking } from "@/domain/entities/Hostel.entity";
import prisma from "@/lib/db";

export class PrismaHostelRepository implements IHostelRepository {
  async createRoom(data: CreateHostelRoomData): Promise<HostelRoom> {
    const room = await prisma.hostelRoom.create({ data });
    return this.toRoomEntity(room);
  }

  async findRoomById(id: string): Promise<HostelRoom | null> {
    const room = await prisma.hostelRoom.findUnique({ where: { id } });
    return room ? this.toRoomEntity(room) : null;
  }

  async findRoomsBySchool(schoolId: string, gender?: string): Promise<HostelRoom[]> {
    const rooms = await prisma.hostelRoom.findMany({
      where: {
        schoolId,
        ...(gender && { gender }),
      },
    });
    return rooms.map(this.toRoomEntity);
  }

  async updateRoom(id: string, data: Partial<CreateHostelRoomData>): Promise<HostelRoom> {
    const room = await prisma.hostelRoom.update({
      where: { id },
      data,
    });
    return this.toRoomEntity(room);
  }

  async createCot(data: CreateHostelCotData): Promise<HostelCot> {
    const cot = await prisma.hostelCot.create({ data });
    return this.toCotEntity(cot);
  }

  async findCotById(id: string): Promise<HostelCot | null> {
    const cot = await prisma.hostelCot.findUnique({ where: { id } });
    return cot ? this.toCotEntity(cot) : null;
  }

  async findCotsByRoom(roomId: string): Promise<HostelCot[]> {
    const cots = await prisma.hostelCot.findMany({
      where: { roomId },
      orderBy: { cotNumber: "asc" },
    });
    return cots.map(this.toCotEntity);
  }

  async findAvailableCots(roomId: string): Promise<HostelCot[]> {
    const cots = await prisma.hostelCot.findMany({
      where: {
        roomId,
        isAvailable: true,
        booking: null,
      },
    });
    return cots.map(this.toCotEntity);
  }

  async updateCotAvailability(cotId: string, isAvailable: boolean): Promise<HostelCot> {
    const cot = await prisma.hostelCot.update({
      where: { id: cotId },
      data: { isAvailable },
    });
    return this.toCotEntity(cot);
  }

  async createBooking(data: CreateHostelBookingData): Promise<HostelBooking> {
    const booking = await prisma.hostelBooking.create({
      data: {
        ...data,
        status: "ACTIVE",
      },
    });
    // Update cot availability
    await prisma.hostelCot.update({
      where: { id: data.cotId },
      data: { isAvailable: false },
    });
    return this.toBookingEntity(booking);
  }

  async findBookingById(id: string): Promise<HostelBooking | null> {
    const booking = await prisma.hostelBooking.findUnique({ where: { id } });
    return booking ? this.toBookingEntity(booking) : null;
  }

  async findBookingsByStudent(studentId: string): Promise<HostelBooking[]> {
    const bookings = await prisma.hostelBooking.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(this.toBookingEntity);
  }

  async findBookingsByRoom(roomId: string): Promise<HostelBooking[]> {
    const bookings = await prisma.hostelBooking.findMany({
      where: { roomId },
    });
    return bookings.map(this.toBookingEntity);
  }

  async updateBookingStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED"): Promise<HostelBooking> {
    const booking = await prisma.hostelBooking.update({
      where: { id },
      data: { status },
    });
    
    // If cancelled or completed, make cot available again
    if (status === "CANCELLED" || status === "COMPLETED") {
      await prisma.hostelCot.update({
        where: { id: booking.cotId },
        data: { isAvailable: true },
      });
    }
    
    return this.toBookingEntity(booking);
  }

  async findActiveBookingByStudent(studentId: string): Promise<HostelBooking | null> {
    const booking = await prisma.hostelBooking.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
    });
    return booking ? this.toBookingEntity(booking) : null;
  }

  private toRoomEntity(prismaRoom: any): HostelRoom {
    return new HostelRoom(
      prismaRoom.id,
      prismaRoom.name,
      prismaRoom.capacity,
      prismaRoom.gender,
      prismaRoom.schoolId,
      prismaRoom.createdAt,
      prismaRoom.updatedAt
    );
  }

  private toCotEntity(prismaCot: any): HostelCot {
    return new HostelCot(
      prismaCot.id,
      prismaCot.cotNumber,
      prismaCot.isAvailable,
      prismaCot.roomId,
      prismaCot.createdAt,
      prismaCot.updatedAt
    );
  }

  private toBookingEntity(prismaBooking: any): HostelBooking {
    return new HostelBooking(
      prismaBooking.id,
      prismaBooking.studentId,
      prismaBooking.roomId,
      prismaBooking.cotId,
      prismaBooking.checkInDate,
      prismaBooking.checkOutDate,
      prismaBooking.status,
      prismaBooking.createdAt,
      prismaBooking.updatedAt
    );
  }
}
