import { IAttendanceRepository, CreateAttendanceData } from "@/domain/repositories/IAttendanceRepository";
import { Attendance } from "@/domain/entities/Attendance.entity";
import prisma from "@/lib/db";

export class PrismaAttendanceRepository implements IAttendanceRepository {
  async create(data: CreateAttendanceData): Promise<Attendance> {
    const attendance = await prisma.attendance.create({ data });
    return this.toAttendanceEntity(attendance);
  }

  async bulkCreate(data: CreateAttendanceData[]): Promise<Attendance[]> {
    const attendances = await prisma.attendance.createManyAndReturn({
      data,
    });
    return attendances.map(this.toAttendanceEntity);
  }

  async findById(id: string): Promise<Attendance | null> {
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    return attendance ? this.toAttendanceEntity(attendance) : null;
  }

  async findByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId,
        ...(startDate && endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: [{ date: "desc" }, { period: "asc" }],
    });
    return attendances.map(this.toAttendanceEntity);
  }

  async findByClass(classId: string, date: Date): Promise<Attendance[]> {
    const attendances = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
    return attendances.map(this.toAttendanceEntity);
  }

  async findByClassAndPeriod(classId: string, date: Date, period: number): Promise<Attendance[]> {
    const attendances = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        period,
      },
    });
    return attendances.map(this.toAttendanceEntity);
  }

  async update(id: string, status: string): Promise<Attendance> {
    const attendance = await prisma.attendance.update({
      where: { id },
      data: { status },
    });
    return this.toAttendanceEntity(attendance);
  }

  async upsert(data: CreateAttendanceData): Promise<Attendance> {
    const dateOnly = new Date(data.date);
    dateOnly.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_classId_date_period: {
          studentId: data.studentId,
          classId: data.classId,
          date: dateOnly,
          period: data.period,
        },
      },
      update: {
        status: data.status,
        teacherId: data.teacherId,
      },
      create: data,
    });
    return this.toAttendanceEntity(attendance);
  }

  private toAttendanceEntity(prismaAttendance: any): Attendance {
    return new Attendance(
      prismaAttendance.id,
      prismaAttendance.date,
      prismaAttendance.period,
      prismaAttendance.status,
      prismaAttendance.studentId,
      prismaAttendance.classId,
      prismaAttendance.teacherId,
      prismaAttendance.createdAt,
      prismaAttendance.updatedAt
    );
  }
}
