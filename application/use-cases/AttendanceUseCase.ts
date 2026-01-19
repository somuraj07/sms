import { IAttendanceRepository } from "@/domain/repositories/IAttendanceRepository";
import { Attendance, AttendanceStatus } from "@/domain/entities/Attendance.entity";
import prisma from "@/lib/db";

export interface MarkAttendanceRequest {
  classId: string;
  date: Date;
  period: number;
  attendances: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
  teacherId: string;
  schoolId: string;
}

export class AttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}

  async markAttendance(request: MarkAttendanceRequest): Promise<Attendance[]> {
    // Validate period
    if (!Attendance.isValidPeriod(request.period)) {
      throw new Error("Period must be between 1 and 8");
    }

    // Verify class belongs to school
    const classData = await prisma.class.findFirst({
      where: {
        id: request.classId,
        schoolId: request.schoolId,
      },
    });

    if (!classData) {
      throw new Error("Class not found or doesn't belong to this school");
    }

    // Validate and create attendance records
    const attendanceData = await Promise.all(
      request.attendances.map(async (att) => {
        // Verify student belongs to class
        const student = await prisma.student.findFirst({
          where: {
            id: att.studentId,
            classId: request.classId,
            schoolId: request.schoolId,
          },
        });

        if (!student) {
          throw new Error(`Student ${att.studentId} not found in this class`);
        }

        return {
          date: request.date,
          period: request.period,
          status: att.status,
          studentId: att.studentId,
          classId: request.classId,
          teacherId: request.teacherId,
        };
      })
    );

    // Upsert attendance records
    const results = await Promise.all(
      attendanceData.map((data) => this.attendanceRepository.upsert(data))
    );

    return results;
  }

  async getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    return this.attendanceRepository.findByStudent(studentId, startDate, endDate);
  }

  async getAttendanceByClass(classId: string, date: Date): Promise<Attendance[]> {
    return this.attendanceRepository.findByClass(classId, date);
  }
}
