import { ExamRoom, ExamSchedule, ExamAllocation, ExamType } from "../entities/Exam.entity";

export interface CreateExamRoomData {
  roomNumber: string;
  capacity: number;
  benchesPerRow: number | null;
  schoolId: string;
}

export interface CreateExamScheduleData {
  examType: ExamType;
  examName: string;
  subject: string;
  department: string | null;
  className: string | null;
  roomId: string;
  schoolId: string;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  studentsPerBench: number;
  invigilatorId: string | null;
}

export interface CreateExamAllocationData {
  studentId: string;
  scheduleId: string;
  roomId: string;
  benchNumber: string;
  seatPosition: "LEFT" | "RIGHT" | null;
  rollNumber: string | null;
}

export interface IExamRepository {
  // Room operations
  createRoom(data: CreateExamRoomData): Promise<ExamRoom>;
  findRoomById(id: string): Promise<ExamRoom | null>;
  findRoomsBySchool(schoolId: string): Promise<ExamRoom[]>;
  findAvailableRooms(schoolId: string, examDate: Date): Promise<ExamRoom[]>;
  updateRoom(id: string, data: Partial<CreateExamRoomData>): Promise<ExamRoom>;
  
  // Schedule operations
  createSchedule(data: CreateExamScheduleData): Promise<ExamSchedule>;
  findScheduleById(id: string): Promise<ExamSchedule | null>;
  findSchedulesBySchool(schoolId: string, examType?: ExamType): Promise<ExamSchedule[]>;
  findSchedulesByDepartment(schoolId: string, department: string): Promise<ExamSchedule[]>;
  findSchedulesByDate(schoolId: string, examDate: Date): Promise<ExamSchedule[]>;
  updateSchedule(id: string, data: Partial<CreateExamScheduleData>): Promise<ExamSchedule>;
  assignInvigilator(scheduleId: string, invigilatorId: string): Promise<ExamSchedule>;
  
  // Allocation operations
  createAllocation(data: CreateExamAllocationData): Promise<ExamAllocation>;
  findAllocationById(id: string): Promise<ExamAllocation | null>;
  findAllocationsBySchedule(scheduleId: string): Promise<ExamAllocation[]>;
  findAllocationsByStudent(studentId: string): Promise<ExamAllocation[]>;
  findAllocationsByRoom(roomId: string, scheduleId: string): Promise<ExamAllocation[]>;
  findOccupiedBenches(scheduleId: string, roomId: string): Promise<Set<string>>;
  deleteAllocation(id: string): Promise<void>;
  bulkCreateAllocations(data: CreateExamAllocationData[]): Promise<ExamAllocation[]>;
}
