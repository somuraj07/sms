import { Attendance, AttendanceStatus } from "../entities/Attendance.entity";

export interface CreateAttendanceData {
  date: Date;
  period: number;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
  teacherId: string;
}

export interface IAttendanceRepository {
  create(data: CreateAttendanceData): Promise<Attendance>;
  bulkCreate(data: CreateAttendanceData[]): Promise<Attendance[]>;
  findById(id: string): Promise<Attendance | null>;
  findByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  findByClass(classId: string, date: Date): Promise<Attendance[]>;
  findByClassAndPeriod(classId: string, date: Date, period: number): Promise<Attendance[]>;
  update(id: string, status: AttendanceStatus): Promise<Attendance>;
  upsert(data: CreateAttendanceData): Promise<Attendance>;
}
