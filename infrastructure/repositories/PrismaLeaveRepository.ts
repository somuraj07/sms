import { ILeaveRepository, CreateLeaveData } from "@/domain/repositories/ILeaveRepository";
import { LeaveRequest, LeaveStatus } from "@/domain/entities/Leave.entity";
import prisma from "@/lib/db";

export class PrismaLeaveRepository implements ILeaveRepository {
  async create(data: CreateLeaveData): Promise<LeaveRequest> {
    const leave = await prisma.leaveRequest.create({ data });
    return this.toLeaveEntity(leave);
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    return leave ? this.toLeaveEntity(leave) : null;
  }

  async findByTeacher(teacherId: string): Promise<LeaveRequest[]> {
    const leaves = await prisma.leaveRequest.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return leaves.map(this.toLeaveEntity);
  }

  async findBySchool(schoolId: string, status?: LeaveStatus): Promise<LeaveRequest[]> {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        schoolId,
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
    });
    return leaves.map(this.toLeaveEntity);
  }

  async findPending(schoolId: string): Promise<LeaveRequest[]> {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        schoolId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
    return leaves.map(this.toLeaveEntity);
  }

  async approve(id: string, approverId: string, remarks?: string): Promise<LeaveRequest> {
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approverId,
        remarks: remarks || null,
      },
    });
    return this.toLeaveEntity(leave);
  }

  async reject(id: string, approverId: string, remarks: string): Promise<LeaveRequest> {
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approverId,
        remarks,
      },
    });
    return this.toLeaveEntity(leave);
  }

  async hasOverlappingLeave(teacherId: string, fromDate: Date, toDate: Date): Promise<boolean> {
    const count = await prisma.leaveRequest.count({
      where: {
        teacherId,
        status: { not: "REJECTED" },
        fromDate: { lte: toDate },
        toDate: { gte: fromDate },
      },
    });
    return count > 0;
  }

  private toLeaveEntity(prismaLeave: any): LeaveRequest {
    return new LeaveRequest(
      prismaLeave.id,
      prismaLeave.teacherId,
      prismaLeave.approverId,
      prismaLeave.schoolId,
      prismaLeave.leaveType,
      prismaLeave.reason,
      prismaLeave.days,
      prismaLeave.fromDate,
      prismaLeave.toDate,
      prismaLeave.status,
      prismaLeave.remarks,
      prismaLeave.createdAt,
      prismaLeave.updatedAt
    );
  }
}
