/**
 * Domain Entity - Hostel Room
 * Pure business logic, no dependencies on infrastructure
 */
export type Gender = "MALE" | "FEMALE" | "OTHER";

export type BookingStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export class HostelRoom {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capacity: number,
    public readonly gender: Gender,
    public readonly schoolId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if room can accommodate more students
   */
  hasAvailableSpace(occupiedCots: number): boolean {
    return occupiedCots < this.capacity;
  }

  /**
   * Domain method: Validate if student gender matches room gender
   */
  canAccommodateGender(studentGender: Gender): boolean {
    return this.gender === studentGender || this.gender === "OTHER";
  }
}

export class HostelCot {
  constructor(
    public readonly id: string,
    public readonly cotNumber: string,
    public readonly isAvailable: boolean,
    public readonly roomId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if cot can be booked
   */
  canBeBooked(): boolean {
    return this.isAvailable;
  }
}

export class HostelBooking {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly roomId: string,
    public readonly cotId: string,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date | null,
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
