import { ILeaveRepository } from "@/domain/repositories/ILeaveRepository";
import { LeaveRequest, LeaveType } from "@/domain/entities/Leave.entity";

export interface CreateLeaveRequest {
  teacherId: string;
  schoolId: string;
  leaveType: LeaveType;
  reason: string;
  days: string;
  fromDate: Date;
  toDate: Date;
}

export class LeaveUseCase {
  constructor(private readonly leaveRepository: ILeaveRepository) {}

  async createLeave(request: CreateLeaveRequest): Promise<LeaveRequest> {
    // Validate date range
    if (!LeaveRequest.isValidDateRange(request.fromDate, request.toDate)) {
      throw new Error("To date must be after or equal to from date");
    }

    // Check for overlapping leaves
    const hasOverlap = await this.leaveRepository.hasOverlappingLeave(
      request.teacherId,
      request.fromDate,
      request.toDate
    );

    if (hasOverlap) {
      throw new Error("Leave already exists for this period");
    }

    return this.leaveRepository.create(request);
  }

  async approveLeave(leaveId: string, approverId: string, remarks?: string): Promise<LeaveRequest> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (!leave.canBeApproved()) {
      throw new Error("Leave request cannot be approved");
    }

    return this.leaveRepository.approve(leaveId, approverId, remarks);
  }

  async rejectLeave(leaveId: string, approverId: string, remarks: string): Promise<LeaveRequest> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (!leave.isPending()) {
      throw new Error("Only pending leave requests can be rejected");
    }

    return this.leaveRepository.reject(leaveId, approverId, remarks);
  }

  async getLeavesByTeacher(teacherId: string): Promise<LeaveRequest[]> {
    return this.leaveRepository.findByTeacher(teacherId);
  }

  async getPendingLeaves(schoolId: string): Promise<LeaveRequest[]> {
    return this.leaveRepository.findPending(schoolId);
  }
}
