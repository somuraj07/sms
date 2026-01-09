/**
 * Domain Entity - Leave Request
 */
export type LeaveType = "CASUAL" | "SICK";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export class LeaveRequest {
  constructor(
    public readonly id: string,
    public readonly teacherId: string,
    public readonly approverId: string | null,
    public readonly schoolId: string,
    public readonly leaveType: LeaveType,
    public readonly reason: string,
    public readonly days: string,
    public readonly fromDate: Date,
    public readonly toDate: Date,
    public readonly status: LeaveStatus,
    public readonly remarks: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if leave is pending
   */
  isPending(): boolean {
    return this.status === "PENDING";
  }

  /**
   * Domain method: Check if leave is approved
   */
  isApproved(): boolean {
    return this.status === "APPROVED";
  }

  /**
   * Domain method: Check if leave can be approved
   */
  canBeApproved(): boolean {
    return this.status === "PENDING";
  }

  /**
   * Domain method: Check if dates are valid
   */
  static isValidDateRange(fromDate: Date, toDate: Date): boolean {
    return toDate >= fromDate;
  }
}
