/**
 * Domain Entity - Attendance
 */
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export class Attendance {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly period: number,
    public readonly status: AttendanceStatus,
    public readonly studentId: string,
    public readonly classId: string,
    public readonly teacherId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if attendance is present
   */
  isPresent(): boolean {
    return this.status === "PRESENT";
  }

  /**
   * Domain method: Validate period number
   */
  static isValidPeriod(period: number): boolean {
    return period >= 1 && period <= 8;
  }
}
