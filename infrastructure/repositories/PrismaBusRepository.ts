import { IBusRepository, CreateBusData, CreateBusSeatData, CreateBusScheduleData, CreateBusBookingData } from "@/domain/repositories/IBusRepository";
import { Bus, BusSeat, BusSchedule, BusBooking } from "@/domain/entities/Bus.entity";
import prisma from "@/lib/db";

export class PrismaBusRepository implements IBusRepository {
  async createBus(data: CreateBusData): Promise<Bus> {
    const bus = await prisma.bus.create({ data });
    return this.toBusEntity(bus);
  }

  async findBusById(id: string): Promise<Bus | null> {
    const bus = await prisma.bus.findUnique({ where: { id } });
    return bus ? this.toBusEntity(bus) : null;
  }

  async findBusesBySchool(schoolId: string): Promise<Bus[]> {
    const buses = await prisma.bus.findMany({
      where: { schoolId },
      orderBy: { busNumber: "asc" },
    });
    return buses.map(this.toBusEntity);
  }

  async updateBus(id: string, data: Partial<CreateBusData>): Promise<Bus> {
    const bus = await prisma.bus.update({
      where: { id },
      data,
    });
    return this.toBusEntity(bus);
  }

  async createSeat(data: CreateBusSeatData): Promise<BusSeat> {
    const seat = await prisma.busSeat.create({ data });
    return this.toSeatEntity(seat);
  }

  async findSeatById(id: string): Promise<BusSeat | null> {
    const seat = await prisma.busSeat.findUnique({ where: { id } });
    return seat ? this.toSeatEntity(seat) : null;
  }

  async findSeatsByBus(busId: string): Promise<BusSeat[]> {
    const seats = await prisma.busSeat.findMany({
      where: { busId },
      orderBy: { seatNumber: "asc" },
    });
    return seats.map(this.toSeatEntity);
  }

  async findAvailableSeats(busId: string): Promise<BusSeat[]> {
    const seats = await prisma.busSeat.findMany({
      where: {
        busId,
        isAvailable: true,
        booking: null,
      },
    });
    return seats.map(this.toSeatEntity);
  }

  async updateSeatAvailability(seatId: string, isAvailable: boolean): Promise<BusSeat> {
    const seat = await prisma.busSeat.update({
      where: { id: seatId },
      data: { isAvailable },
    });
    return this.toSeatEntity(seat);
  }

  async createSchedule(data: CreateBusScheduleData): Promise<BusSchedule> {
    const schedule = await prisma.busSchedule.create({ data });
    return this.toScheduleEntity(schedule);
  }

  async findScheduleById(id: string): Promise<BusSchedule | null> {
    const schedule = await prisma.busSchedule.findUnique({ where: { id } });
    return schedule ? this.toScheduleEntity(schedule) : null;
  }

  async findSchedulesByBus(busId: string): Promise<BusSchedule[]> {
    const schedules = await prisma.busSchedule.findMany({
      where: { busId },
      orderBy: { departureTime: "asc" },
    });
    return schedules.map(this.toScheduleEntity);
  }

  async findSchedulesByClass(className: string, schoolId: string): Promise<BusSchedule[]> {
    const schedules = await prisma.busSchedule.findMany({
      where: {
        className,
        bus: { schoolId },
        isActive: true,
      },
      include: { bus: true },
      orderBy: { departureTime: "asc" },
    });
    return schedules.map(this.toScheduleEntity);
  }

  async updateSchedule(id: string, data: Partial<CreateBusScheduleData>): Promise<BusSchedule> {
    const schedule = await prisma.busSchedule.update({
      where: { id },
      data,
    });
    return this.toScheduleEntity(schedule);
  }

  async createBooking(data: CreateBusBookingData): Promise<BusBooking> {
    const booking = await prisma.busBooking.create({
      data: {
        ...data,
        status: "ACTIVE",
      },
    });
    // Update seat availability
    await prisma.busSeat.update({
      where: { id: data.seatId },
      data: { isAvailable: false },
    });
    return this.toBookingEntity(booking);
  }

  async findBookingById(id: string): Promise<BusBooking | null> {
    const booking = await prisma.busBooking.findUnique({ where: { id } });
    return booking ? this.toBookingEntity(booking) : null;
  }

  async findBookingsByStudent(studentId: string): Promise<BusBooking[]> {
    const bookings = await prisma.busBooking.findMany({
      where: { studentId },
      orderBy: { travelDate: "desc" },
    });
    return bookings.map(this.toBookingEntity);
  }

  async findBookingsByBus(busId: string, travelDate?: Date): Promise<BusBooking[]> {
    const bookings = await prisma.busBooking.findMany({
      where: {
        busId,
        ...(travelDate && {
          travelDate: {
            gte: new Date(travelDate.setHours(0, 0, 0, 0)),
            lt: new Date(travelDate.setHours(23, 59, 59, 999)),
          },
        }),
      },
    });
    return bookings.map(this.toBookingEntity);
  }

  async updateBookingStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED"): Promise<BusBooking> {
    const booking = await prisma.busBooking.update({
      where: { id },
      data: { status },
    });
    
    // If cancelled or completed, make seat available again
    if (status === "CANCELLED" || status === "COMPLETED") {
      await prisma.busSeat.update({
        where: { id: booking.seatId },
        data: { isAvailable: true },
      });
    }
    
    return this.toBookingEntity(booking);
  }

  private toBusEntity(prismaBus: any): Bus {
    return new Bus(
      prismaBus.id,
      prismaBus.busNumber,
      prismaBus.busName,
      prismaBus.totalSeats,
      prismaBus.routeName,
      prismaBus.schoolId,
      prismaBus.createdAt,
      prismaBus.updatedAt
    );
  }

  private toSeatEntity(prismaSeat: any): BusSeat {
    return new BusSeat(
      prismaSeat.id,
      prismaSeat.seatNumber,
      prismaSeat.seatType,
      prismaSeat.isAvailable,
      prismaSeat.busId,
      prismaSeat.createdAt,
      prismaSeat.updatedAt
    );
  }

  private toScheduleEntity(prismaSchedule: any): BusSchedule {
    return new BusSchedule(
      prismaSchedule.id,
      prismaSchedule.busId,
      prismaSchedule.className,
      prismaSchedule.departureTime,
      prismaSchedule.arrivalTime,
      prismaSchedule.pickupPoint,
      prismaSchedule.dropPoint,
      prismaSchedule.isActive,
      prismaSchedule.createdAt,
      prismaSchedule.updatedAt
    );
  }

  private toBookingEntity(prismaBooking: any): BusBooking {
    return new BusBooking(
      prismaBooking.id,
      prismaBooking.studentId,
      prismaBooking.busId,
      prismaBooking.seatId,
      prismaBooking.scheduleId,
      prismaBooking.travelDate,
      prismaBooking.status,
      prismaBooking.createdAt,
      prismaBooking.updatedAt
    );
  }
}
