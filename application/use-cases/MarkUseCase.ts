import { IMarkRepository } from "@/domain/repositories/IMarkRepository";
import { Mark } from "@/domain/entities/Mark.entity";
import prisma from "@/lib/db";

export interface CreateMarkRequest {
  studentId: string;
  classId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  suggestions: string | null;
  examId: string;
  teacherId: string;
  schoolId: string;
}

export class MarkUseCase {
  constructor(private readonly markRepository: IMarkRepository) {}

  async createMark(request: CreateMarkRequest): Promise<Mark> {
    // Validate marks
    if (!Mark.isValidMarks(request.marks, request.totalMarks)) {
      throw new Error("Invalid marks: marks must be between 0 and totalMarks");
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

    // Verify student belongs to class
    const student = await prisma.student.findFirst({
      where: {
        id: request.studentId,
        classId: request.classId,
        schoolId: request.schoolId,
      },
    });

    if (!student) {
      throw new Error("Student not found in this class");
    }

    // Calculate grade
    const percentage = (request.marks / request.totalMarks) * 100;
    const grade = Mark.calculateGrade(percentage);

    return this.markRepository.create({
      subject: request.subject,
      marks: request.marks,
      totalMarks: request.totalMarks,
      grade,
      suggestions: request.suggestions,
      examId: request.examId,
      studentId: request.studentId,
      classId: request.classId,
      teacherId: request.teacherId,
    });
  }

  async getMarksByStudent(studentId: string, examId?: string): Promise<Mark[]> {
    return this.markRepository.findByStudent(studentId, examId);
  }

  async getMarksByClass(classId: string, examId: string): Promise<Mark[]> {
    return this.markRepository.findByClass(classId, examId);
  }
}
