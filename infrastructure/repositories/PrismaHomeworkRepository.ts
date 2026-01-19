import { IHomeworkRepository, CreateHomeworkData } from "@/domain/repositories/IHomeworkRepository";
import { Homework } from "@/domain/entities/Homework.entity";
import prisma from "@/lib/db";

export class PrismaHomeworkRepository implements IHomeworkRepository {
  async create(data: CreateHomeworkData): Promise<Homework> {
    const homework = await prisma.homework.create({ data });
    return this.toHomeworkEntity(homework);
  }

  async findById(id: string): Promise<Homework | null> {
    const homework = await prisma.homework.findUnique({ where: { id } });
    return homework ? this.toHomeworkEntity(homework) : null;
  }

  async findByClass(classId: string): Promise<Homework[]> {
    const homeworks = await prisma.homework.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return homeworks.map(this.toHomeworkEntity);
  }

  async findByTeacher(teacherId: string): Promise<Homework[]> {
    const homeworks = await prisma.homework.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return homeworks.map(this.toHomeworkEntity);
  }

  async findByStudent(studentId: string): Promise<Homework[]> {
    // Get student's class first
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student?.classId) return [];

    const homeworks = await prisma.homework.findMany({
      where: { classId: student.classId },
      orderBy: { createdAt: "desc" },
    });
    return homeworks.map(this.toHomeworkEntity);
  }

  async update(id: string, data: Partial<CreateHomeworkData>): Promise<Homework> {
    const homework = await prisma.homework.update({
      where: { id },
      data,
    });
    return this.toHomeworkEntity(homework);
  }

  async delete(id: string): Promise<void> {
    await prisma.homework.delete({ where: { id } });
  }

  private toHomeworkEntity(prismaHomework: any): Homework {
    return new Homework(
      prismaHomework.id,
      prismaHomework.title,
      prismaHomework.description,
      prismaHomework.subject,
      prismaHomework.dueDate,
      prismaHomework.classId,
      prismaHomework.teacherId,
      prismaHomework.schoolId,
      prismaHomework.createdAt,
      prismaHomework.updatedAt
    );
  }
}
