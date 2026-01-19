/**
 * Domain Entity - Examination System
 * Pure business logic, no dependencies on infrastructure
 */
export type ExamType = "SEMESTER" | "MID_TERM" | "FINAL" | "UNIT_TEST";

export type SeatPosition = "LEFT" | "RIGHT";

export class ExamRoom {
  constructor(
    public readonly id: string,
    public readonly roomNumber: string,
    public readonly capacity: number,
    public readonly benchesPerRow: number | null,
    public readonly isActive: boolean,
    public readonly schoolId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if room is available for allocation
   */
  isAvailable(): boolean {
    return this.isActive;
  }

  /**
   * Domain method: Calculate total capacity based on students per bench
   */
  calculateCapacity(studentsPerBench: number): number {
    return this.capacity * studentsPerBench;
  }
}

export class ExamSchedule {
  constructor(
    public readonly id: string,
    public readonly examType: ExamType,
    public readonly examName: string,
    public readonly subject: string,
    public readonly department: string | null,
    public readonly className: string | null,
    public readonly roomId: string,
    public readonly schoolId: string,
    public readonly examDate: Date,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly studentsPerBench: number,
    public readonly invigilatorId: string | null,
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
   * Domain method: Check if exam type requires 2 students per bench
   */
  requiresTwoPerBench(): boolean {
    return this.studentsPerBench === 2;
  }

  /**
   * Domain method: Check if schedule matches department
   */
  matchesDepartment(department: string): boolean {
    return this.department === null || this.department === department;
  }
}

export class ExamAllocation {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly scheduleId: string,
    public readonly roomId: string,
    public readonly benchNumber: string,
    public readonly seatPosition: SeatPosition | null,
    public readonly rollNumber: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if allocation has seat position (for 2 per bench)
   */
  hasSeatPosition(): boolean {
    return this.seatPosition !== null;
  }
}
