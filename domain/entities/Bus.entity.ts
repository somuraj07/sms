/**
 * Domain Entity - Bus Booking System
 * Pure business logic, no dependencies on infrastructure
 */
export type SeatType = "WINDOW" | "AISLE" | "MIDDLE";

export type BookingStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export class Bus {
  constructor(
    public readonly id: string,
    public readonly busNumber: string,
    public readonly busName: string | null,
    public readonly totalSeats: number,
    public readonly routeName: string,
    public readonly schoolId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if bus has available seats
   */
  hasAvailableSeats(occupiedSeats: number): boolean {
    return occupiedSeats < this.totalSeats;
  }
}

export class BusSeat {
  constructor(
    public readonly id: string,
    public readonly seatNumber: string,
    public readonly seatType: SeatType | null,
    public readonly isAvailable: boolean,
    public readonly busId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if seat can be booked
   */
  canBeBooked(): boolean {
    return this.isAvailable;
  }
}

export class BusSchedule {
  constructor(
    public readonly id: string,
    public readonly busId: string,
    public readonly className: string,
    public readonly departureTime: Date,
    public readonly arrivalTime: Date,
    public readonly pickupPoint: string | null,
    public readonly dropPoint: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if schedule is active
   */
  isActiveSchedule(): boolean {
    return this.isActive;
  }

  /**
   * Domain method: Check if schedule matches class
   */
  matchesClass(className: string): boolean {
    return this.className === className;
  }
}

export class BusBooking {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly busId: string,
    public readonly seatId: string,
    public readonly scheduleId: string | null,
    public readonly travelDate: Date,
    public readonly status: BookingStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if booking is active
   */
  isActive(): boolean {
    return this.status === "ACTIVE";
  }

  /**
   * Domain method: Check if booking can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status === "ACTIVE";
  }
}
