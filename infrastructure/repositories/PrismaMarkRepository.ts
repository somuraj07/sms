import { IMarkRepository, CreateMarkData } from "@/domain/repositories/IMarkRepository";
import { Mark } from "@/domain/entities/Mark.entity";
import prisma from "@/lib/db";

export class PrismaMarkRepository implements IMarkRepository {
  async create(data: CreateMarkData): Promise<Mark> {
    const mark = await prisma.mark.create({ data });
    return this.toMarkEntity(mark);
  }

  async findById(id: string): Promise<Mark | null> {
    const mark = await prisma.mark.findUnique({ where: { id } });
    return mark ? this.toMarkEntity(mark) : null;
  }

  async findByStudent(studentId: string, examId?: string): Promise<Mark[]> {
    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        ...(examId && { examId }),
      },
      orderBy: { createdAt: "desc" },
    });
    return marks.map(this.toMarkEntity);
  }

  async findByClass(classId: string, examId: string): Promise<Mark[]> {
    const marks = await prisma.mark.findMany({
      where: { classId, examId },
      orderBy: { createdAt: "desc" },
    });
    return marks.map(this.toMarkEntity);
  }

  async findByExam(examId: string): Promise<Mark[]> {
    const marks = await prisma.mark.findMany({
      where: { examId },
      orderBy: { createdAt: "desc" },
    });
    return marks.map(this.toMarkEntity);
  }

  async update(id: string, data: Partial<CreateMarkData>): Promise<Mark> {
    const mark = await prisma.mark.update({
      where: { id },
      data,
    });
    return this.toMarkEntity(mark);
  }

  private toMarkEntity(prismaMark: any): Mark {
    return new Mark(
      prismaMark.id,
      prismaMark.subject,
      prismaMark.marks,
      prismaMark.totalMarks,
      prismaMark.grade,
      prismaMark.suggestions,
      prismaMark.examId,
      prismaMark.studentId,
      prismaMark.classId,
      prismaMark.teacherId,
      prismaMark.createdAt,
      prismaMark.updatedAt
    );
  }
}
