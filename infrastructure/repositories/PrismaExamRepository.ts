import { IExamRepository, CreateExamRoomData, CreateExamScheduleData, CreateExamAllocationData } from "@/domain/repositories/IExamRepository";
import { ExamRoom, ExamSchedule, ExamAllocation } from "@/domain/entities/Exam.entity";
import prisma from "@/lib/db";

export class PrismaExamRepository implements IExamRepository {
  async createRoom(data: CreateExamRoomData): Promise<ExamRoom> {
    const room = await prisma.examRoom.create({ data });
    return this.toRoomEntity(room);
  }

  async findRoomById(id: string): Promise<ExamRoom | null> {
    const room = await prisma.examRoom.findUnique({ where: { id } });
    return room ? this.toRoomEntity(room) : null;
  }

  async findRoomsBySchool(schoolId: string): Promise<ExamRoom[]> {
    const rooms = await prisma.examRoom.findMany({
      where: { schoolId },
      orderBy: { roomNumber: "asc" },
    });
    return rooms.map(this.toRoomEntity);
  }

  async findAvailableRooms(schoolId: string, examDate: Date): Promise<ExamRoom[]> {
    // Find rooms that don't have conflicting schedules on the same date
    const conflictingSchedules = await prisma.examSchedule.findMany({
      where: {
        schoolId,
        examDate: {
          gte: new Date(examDate.setHours(0, 0, 0, 0)),
          lt: new Date(examDate.setHours(23, 59, 59, 999)),
        },
        isActive: true,
      },
      select: { roomId: true },
    });
    
    const occupiedRoomIds = new Set(conflictingSchedules.map(s => s.roomId));
    
    const rooms = await prisma.examRoom.findMany({
      where: {
        schoolId,
        isActive: true,
        id: {
          notIn: Array.from(occupiedRoomIds),
        },
      },
    });
    
    return rooms.map(this.toRoomEntity);
  }

  async updateRoom(id: string, data: Partial<CreateExamRoomData>): Promise<ExamRoom> {
    const room = await prisma.examRoom.update({
      where: { id },
      data,
    });
    return this.toRoomEntity(room);
  }

  async createSchedule(data: CreateExamScheduleData): Promise<ExamSchedule> {
    const schedule = await prisma.examSchedule.create({ data });
    return this.toScheduleEntity(schedule);
  }

  async findScheduleById(id: string): Promise<ExamSchedule | null> {
    const schedule = await prisma.examSchedule.findUnique({ where: { id } });
    return schedule ? this.toScheduleEntity(schedule) : null;
  }

  async findSchedulesBySchool(schoolId: string, examType?: string): Promise<ExamSchedule[]> {
    const schedules = await prisma.examSchedule.findMany({
      where: {
        schoolId,
        ...(examType && { examType }),
      },
      orderBy: { examDate: "asc" },
    });
    return schedules.map(this.toScheduleEntity);
  }

  async findSchedulesByDepartment(schoolId: string, department: string): Promise<ExamSchedule[]> {
    const schedules = await prisma.examSchedule.findMany({
      where: {
        schoolId,
        department,
        isActive: true,
      },
      orderBy: { examDate: "asc" },
    });
    return schedules.map(this.toScheduleEntity);
  }

  async findSchedulesByDate(schoolId: string, examDate: Date): Promise<ExamSchedule[]> {
    const schedules = await prisma.examSchedule.findMany({
      where: {
        schoolId,
        examDate: {
          gte: new Date(examDate.setHours(0, 0, 0, 0)),
          lt: new Date(examDate.setHours(23, 59, 59, 999)),
        },
        isActive: true,
      },
      orderBy: { startTime: "asc" },
    });
    return schedules.map(this.toScheduleEntity);
  }

  async updateSchedule(id: string, data: Partial<CreateExamScheduleData>): Promise<ExamSchedule> {
    const schedule = await prisma.examSchedule.update({
      where: { id },
      data,
    });
    return this.toScheduleEntity(schedule);
  }

  async assignInvigilator(scheduleId: string, invigilatorId: string): Promise<ExamSchedule> {
    const schedule = await prisma.examSchedule.update({
      where: { id: scheduleId },
      data: { invigilatorId },
    });
    return this.toScheduleEntity(schedule);
  }

  async createAllocation(data: CreateExamAllocationData): Promise<ExamAllocation> {
    const allocation = await prisma.examAllocation.create({ data });
    return this.toAllocationEntity(allocation);
  }

  async findAllocationById(id: string): Promise<ExamAllocation | null> {
    const allocation = await prisma.examAllocation.findUnique({ where: { id } });
    return allocation ? this.toAllocationEntity(allocation) : null;
  }

  async findAllocationsBySchedule(scheduleId: string): Promise<ExamAllocation[]> {
    const allocations = await prisma.examAllocation.findMany({
      where: { scheduleId },
      orderBy: [{ benchNumber: "asc" }, { seatPosition: "asc" }],
    });
    return allocations.map(this.toAllocationEntity);
  }

  async findAllocationsByStudent(studentId: string): Promise<ExamAllocation[]> {
    const allocations = await prisma.examAllocation.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return allocations.map(this.toAllocationEntity);
  }

  async findAllocationsByRoom(roomId: string, scheduleId: string): Promise<ExamAllocation[]> {
    const allocations = await prisma.examAllocation.findMany({
      where: {
        roomId,
        scheduleId,
      },
      orderBy: [{ benchNumber: "asc" }, { seatPosition: "asc" }],
    });
    return allocations.map(this.toAllocationEntity);
  }

  async findOccupiedBenches(scheduleId: string, roomId: string): Promise<Set<string>> {
    const allocations = await prisma.examAllocation.findMany({
      where: {
        scheduleId,
        roomId,
      },
      select: {
        benchNumber: true,
        seatPosition: true,
      },
    });
    
    const occupied = new Set<string>();
    allocations.forEach(alloc => {
      const key = alloc.seatPosition 
        ? `${alloc.benchNumber}-${alloc.seatPosition}` 
        : alloc.benchNumber;
      occupied.add(key);
    });
    
    return occupied;
  }

  async deleteAllocation(id: string): Promise<void> {
    await prisma.examAllocation.delete({ where: { id } });
  }

  async bulkCreateAllocations(data: CreateExamAllocationData[]): Promise<ExamAllocation[]> {
    const allocations = await prisma.examAllocation.createManyAndReturn({
      data,
    });
    return allocations.map(this.toAllocationEntity);
  }

  private toRoomEntity(prismaRoom: any): ExamRoom {
    return new ExamRoom(
      prismaRoom.id,
      prismaRoom.roomNumber,
      prismaRoom.capacity,
      prismaRoom.benchesPerRow,
      prismaRoom.isActive,
      prismaRoom.schoolId,
      prismaRoom.createdAt,
      prismaRoom.updatedAt
    );
  }

  private toScheduleEntity(prismaSchedule: any): ExamSchedule {
    return new ExamSchedule(
      prismaSchedule.id,
      prismaSchedule.examType,
      prismaSchedule.examName,
      prismaSchedule.subject,
      prismaSchedule.department,
      prismaSchedule.className,
      prismaSchedule.roomId,
      prismaSchedule.schoolId,
      prismaSchedule.examDate,
      prismaSchedule.startTime,
      prismaSchedule.endTime,
      prismaSchedule.studentsPerBench,
      prismaSchedule.invigilatorId,
      prismaSchedule.isActive,
      prismaSchedule.createdAt,
      prismaSchedule.updatedAt
    );
  }

  private toAllocationEntity(prismaAllocation: any): ExamAllocation {
    return new ExamAllocation(
      prismaAllocation.id,
      prismaAllocation.studentId,
      prismaAllocation.scheduleId,
      prismaAllocation.roomId,
      prismaAllocation.benchNumber,
      prismaAllocation.seatPosition,
      prismaAllocation.rollNumber,
      prismaAllocation.createdAt,
      prismaAllocation.updatedAt
    );
  }
}
