import { LeaveRequest, LeaveType, LeaveStatus } from "../entities/Leave.entity";

export interface CreateLeaveData {
  teacherId: string;
  schoolId: string;
  leaveType: LeaveType;
  reason: string;
  days: string;
  fromDate: Date;
  toDate: Date;
}

export interface ILeaveRepository {
  create(data: CreateLeaveData): Promise<LeaveRequest>;
  findById(id: string): Promise<LeaveRequest | null>;
  findByTeacher(teacherId: string): Promise<LeaveRequest[]>;
  findBySchool(schoolId: string, status?: LeaveStatus): Promise<LeaveRequest[]>;
  findPending(schoolId: string): Promise<LeaveRequest[]>;
  approve(id: string, approverId: string, remarks?: string): Promise<LeaveRequest>;
  reject(id: string, approverId: string, remarks: string): Promise<LeaveRequest>;
  hasOverlappingLeave(teacherId: string, fromDate: Date, toDate: Date): Promise<boolean>;
}
