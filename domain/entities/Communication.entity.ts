/**
 * Domain Entity - Communication (Appointments & Messages)
 */
export type AppointmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly schoolId: string,
    public readonly requestedAt: Date,
    public readonly scheduledAt: Date | null,
    public readonly status: AppointmentStatus,
    public readonly note: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if appointment is pending
   */
  isPending(): boolean {
    return this.status === "PENDING";
  }

  /**
   * Domain method: Check if appointment can be approved
   */
  canBeApproved(): boolean {
    return this.status === "PENDING";
  }
}

export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly appointmentId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly createdAt: Date
  ) {}
}
