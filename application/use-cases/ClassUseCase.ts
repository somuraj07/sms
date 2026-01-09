import { IClassRepository } from "@/domain/repositories/IClassRepository";
import { Class } from "@/domain/entities/Class.entity";
import prisma from "@/lib/db";

export interface CreateClassRequest {
  name: string;
  section: string | null;
  schoolId: string;
  teacherId: string | null;
}

export class ClassUseCase {
  constructor(private readonly classRepository: IClassRepository) {}

  async createClass(request: CreateClassRequest): Promise<Class> {
    // Validate teacher if provided
    if (request.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: request.teacherId,
          schoolId: request.schoolId,
          role: "TEACHER",
        },
      });

      if (!teacher) {
        throw new Error("Teacher not found or doesn't belong to this school");
      }
    }

    return this.classRepository.create({
      name: request.name,
      section: request.section,
      schoolId: request.schoolId,
      teacherId: request.teacherId,
    });
  }

  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    return this.classRepository.findBySchool(schoolId);
  }

  async assignTeacher(classId: string, teacherId: string, schoolId: string): Promise<Class> {
    // Verify teacher belongs to school
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        schoolId,
        role: "TEACHER",
      },
    });

    if (!teacher) {
      throw new Error("Teacher not found or doesn't belong to this school");
    }

    // Verify class belongs to school
    const classData = await this.classRepository.findById(classId);
    if (!classData || classData.schoolId !== schoolId) {
      throw new Error("Class not found or doesn't belong to this school");
    }

    return this.classRepository.assignTeacher(classId, teacherId);
  }
}
