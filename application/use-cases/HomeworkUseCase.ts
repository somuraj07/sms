import { IHomeworkRepository } from "@/domain/repositories/IHomeworkRepository";
import { Homework } from "@/domain/entities/Homework.entity";
import prisma from "@/lib/db";

export interface CreateHomeworkRequest {
  title: string;
  description: string;
  subject: string;
  dueDate: Date | null;
  classId: string;
  teacherId: string;
  schoolId: string;
}

export class HomeworkUseCase {
  constructor(private readonly homeworkRepository: IHomeworkRepository) {}

  async createHomework(request: CreateHomeworkRequest): Promise<Homework> {
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

    return this.homeworkRepository.create(request);
  }

  async getHomeworksByClass(classId: string): Promise<Homework[]> {
    return this.homeworkRepository.findByClass(classId);
  }

  async getHomeworksByTeacher(teacherId: string): Promise<Homework[]> {
    return this.homeworkRepository.findByTeacher(teacherId);
  }

  async getHomeworksByStudent(studentId: string): Promise<Homework[]> {
    return this.homeworkRepository.findByStudent(studentId);
  }
}
