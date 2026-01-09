import { IBusRepository } from "@/domain/repositories/IBusRepository";
import { Bus, BusSeat, BusSchedule, BusBooking } from "@/domain/entities/Bus.entity";

export interface CreateBusRequest {
  busNumber: string;
  busName: string | null;
  totalSeats: number;
  routeName: string;
  schoolId: string;
}

export interface CreateBusScheduleRequest {
  busId: string;
  className: string;
  departureTime: Date;
  arrivalTime: Date;
  pickupPoint: string | null;
  dropPoint: string | null;
}

export interface BookBusSeatRequest {
  studentId: string;
  busId: string;
  seatId: string;
  scheduleId: string | null;
  travelDate: Date;
}

export class BusBookingUseCase {
  constructor(private readonly busRepository: IBusRepository) {}

  async createBus(request: CreateBusRequest): Promise<Bus> {
    if (request.totalSeats <= 0) {
      throw new Error("Bus must have at least one seat");
    }

    const bus = await this.busRepository.createBus({
      busNumber: request.busNumber,
      busName: request.busName,
      totalSeats: request.totalSeats,
      routeName: request.routeName,
      schoolId: request.schoolId,
    });

    // Create seats for the bus
    for (let i = 1; i <= request.totalSeats; i++) {
      let seatType: "WINDOW" | "AISLE" | "MIDDLE" | null = null;
      // Simple logic: alternate window/aisle
      if (i % 2 === 1) seatType = "WINDOW";
      else seatType = "AISLE";

      await this.busRepository.createSeat({
        seatNumber: i.toString(),
        seatType,
        busId: bus.id,
      });
    }

    return bus;
  }

  async createSchedule(request: CreateBusScheduleRequest): Promise<BusSchedule> {
    if (request.arrivalTime <= request.departureTime) {
      throw new Error("Arrival time must be after departure time");
    }

    return this.busRepository.createSchedule(request);
  }

  async bookSeat(request: BookBusSeatRequest): Promise<BusBooking> {
    // Validate seat availability
    const seat = await this.busRepository.findSeatById(request.seatId);
    if (!seat) {
      throw new Error("Seat not found");
    }

    if (!seat.canBeBooked()) {
      throw new Error("Seat is not available");
    }

    if (seat.busId !== request.busId) {
      throw new Error("Seat does not belong to the specified bus");
    }

    // Check if student already booked this date
    const existingBookings = await this.busRepository.findBookingsByStudent(request.studentId);
    const hasBookingOnDate = existingBookings.some(
      booking => 
        booking.busId === request.busId &&
        booking.travelDate.toDateString() === request.travelDate.toDateString() &&
        booking.isActive()
    );

    if (hasBookingOnDate) {
      throw new Error("Student already has a booking for this bus on this date");
    }

    // Create booking
    const booking = await this.busRepository.createBooking({
      studentId: request.studentId,
      busId: request.busId,
      seatId: request.seatId,
      scheduleId: request.scheduleId,
      travelDate: request.travelDate,
    });

    return booking;
  }

  async getBusAvailability(busId: string, travelDate?: Date): Promise<{
    bus: Bus;
    totalSeats: number;
    availableSeats: BusSeat[];
    occupiedSeats: number;
  }> {
    const bus = await this.busRepository.findBusById(busId);
    if (!bus) {
      throw new Error("Bus not found");
    }

    const allSeats = await this.busRepository.findSeatsByBus(busId);
    const availableSeats = await this.busRepository.findAvailableSeats(busId);

    // Filter by date if provided
    let occupiedCount = allSeats.length - availableSeats.length;
    if (travelDate) {
      const bookings = await this.busRepository.findBookingsByBus(busId, travelDate);
      occupiedCount = bookings.filter(b => b.isActive()).length;
    }

    return {
      bus,
      totalSeats: allSeats.length,
      availableSeats,
      occupiedSeats: occupiedCount,
    };
  }

  async getSchedulesByClass(className: string, schoolId: string): Promise<BusSchedule[]> {
    return this.busRepository.findSchedulesByClass(className, schoolId);
  }

  async cancelBooking(bookingId: string): Promise<BusBooking> {
    const booking = await this.busRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.canBeCancelled()) {
      throw new Error("Booking cannot be cancelled");
    }

    return this.busRepository.updateBookingStatus(bookingId, "CANCELLED");
  }
}
