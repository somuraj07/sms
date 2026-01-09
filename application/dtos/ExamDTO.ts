/**
 * Exam Allocation DTOs for Frontend
 */

export interface ExamRoomDTO {
  id: string;
  roomNumber: string;
  capacity: number;
  benchesPerRow: number | null;
  isActive: boolean;
  schoolId: string;
}

export interface ExamScheduleDTO {
  id: string;
  examType: "SEMESTER" | "MID_TERM" | "FINAL" | "UNIT_TEST";
  examName: string;
  subject: string;
  department: string | null;
  className: string | null;
  roomId: string;
  roomNumber?: string;
  schoolId: string;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  studentsPerBench: number;
  invigilatorId: string | null;
  invigilatorName?: string;
  isActive: boolean;
}

export interface ExamAllocationDTO {
  id: string;
  studentId: string;
  studentName?: string;
  scheduleId: string;
  examName?: string;
  roomId: string;
  roomNumber?: string;
  benchNumber: string;
  seatPosition: "LEFT" | "RIGHT" | null;
  rollNumber: string | null;
  createdAt: Date;
}
