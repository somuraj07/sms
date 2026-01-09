import { IExamRepository } from "@/domain/repositories/IExamRepository";
import { ExamRoom, ExamSchedule, ExamAllocation } from "@/domain/entities/Exam.entity";
import prisma from "@/lib/db";

export interface CreateExamRoomRequest {
  roomNumber: string;
  capacity: number;
  benchesPerRow: number | null;
  schoolId: string;
}

export interface CreateExamScheduleRequest {
  examType: "SEMESTER" | "MID_TERM" | "FINAL" | "UNIT_TEST";
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

export interface AllocateStudentsRequest {
  scheduleId: string;
  studentIds: string[];
  department?: string;
}

export class ExamAllocationUseCase {
  constructor(private readonly examRepository: IExamRepository) {}

  async createRoom(request: CreateExamRoomRequest): Promise<ExamRoom> {
    if (request.capacity <= 0) {
      throw new Error("Room capacity must be greater than 0");
    }

    return this.examRepository.createRoom(request);
  }

  async createSchedule(request: CreateExamScheduleRequest): Promise<ExamSchedule> {
    if (request.endTime <= request.startTime) {
      throw new Error("End time must be after start time");
    }

    if (request.studentsPerBench < 1 || request.studentsPerBench > 2) {
      throw new Error("Students per bench must be 1 or 2");
    }

    return this.examRepository.createSchedule(request);
  }

  async assignInvigilator(scheduleId: string, invigilatorId: string): Promise<ExamSchedule> {
    const schedule = await this.examRepository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Exam schedule not found");
    }

    // Verify user is a teacher/examiner
    const user = await prisma.user.findUnique({
      where: { id: invigilatorId },
    });

    if (!user || !["TEACHER", "EXAMINER", "HOD"].includes(user.role)) {
      throw new Error("User is not authorized to be an invigilator");
    }

    return this.examRepository.assignInvigilator(scheduleId, invigilatorId);
  }

  async allocateStudents(request: AllocateStudentsRequest): Promise<ExamAllocation[]> {
    const schedule = await this.examRepository.findScheduleById(request.scheduleId);
    if (!schedule) {
      throw new Error("Exam schedule not found");
    }

    if (!schedule.isActiveSchedule()) {
      throw new Error("Exam schedule is not active");
    }

    // Filter students by department if specified
    let studentIds = request.studentIds;
    if (request.department) {
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          class: {
            name: { contains: request.department },
          },
        },
      });
      studentIds = students.map(s => s.id);
    }

    // Get room
    const room = await this.examRepository.findRoomById(schedule.roomId);
    if (!room) {
      throw new Error("Exam room not found");
    }

    // Get occupied benches
    const occupiedBenches = await this.examRepository.findOccupiedBenches(
      request.scheduleId,
      schedule.roomId
    );

    // Allocate students
    const allocations: any[] = [];
    let benchNumber = 1;
    let seatPosition: "LEFT" | "RIGHT" | null = null;

    for (const studentId of studentIds) {
      // Check if student already allocated
      const existing = await this.examRepository.findAllocationsByStudent(studentId);
      const alreadyAllocated = existing.some(a => a.scheduleId === request.scheduleId);
      
      if (alreadyAllocated) {
        continue; // Skip already allocated students
      }

      // Find next available bench
      let benchKey = benchNumber.toString();
      if (schedule.requiresTwoPerBench()) {
        // For 2 per bench, need LEFT and RIGHT positions
        if (!seatPosition || seatPosition === "RIGHT") {
          seatPosition = "LEFT";
        } else {
          seatPosition = "RIGHT";
          benchNumber++;
        }
        benchKey = `${benchNumber}-${seatPosition}`;
      } else {
        seatPosition = null;
        benchNumber++;
      }

      // Check if bench is occupied
      while (occupiedBenches.has(benchKey)) {
        benchNumber++;
        if (schedule.requiresTwoPerBench()) {
          seatPosition = seatPosition === "LEFT" ? "RIGHT" : "LEFT";
          benchKey = `${benchNumber}-${seatPosition}`;
        } else {
          benchKey = benchNumber.toString();
        }
      }

      // Check room capacity
      const totalCapacity = room.calculateCapacity(schedule.studentsPerBench);
      if (allocations.length >= totalCapacity) {
        throw new Error("Room capacity exceeded");
      }

      // Get student roll number
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      allocations.push({
        studentId,
        scheduleId: request.scheduleId,
        roomId: schedule.roomId,
        benchNumber: benchNumber.toString(),
        seatPosition,
        rollNumber: student?.rollNo || null,
      });

      occupiedBenches.add(benchKey);
    }

    return this.examRepository.bulkCreateAllocations(allocations);
  }

  async getAllocationsBySchedule(scheduleId: string): Promise<ExamAllocation[]> {
    return this.examRepository.findAllocationsBySchedule(scheduleId);
  }

  async getAllocationsByDepartment(schoolId: string, department: string): Promise<ExamAllocation[]> {
    const schedules = await this.examRepository.findSchedulesByDepartment(schoolId, department);
    const allAllocations: ExamAllocation[] = [];

    for (const schedule of schedules) {
      const allocations = await this.examRepository.findAllocationsBySchedule(schedule.id);
      allAllocations.push(...allocations);
    }

    return allAllocations;
  }
}
