import { IClassRepository, CreateClassData } from "@/domain/repositories/IClassRepository";
import { Class } from "@/domain/entities/Class.entity";
import prisma from "@/lib/db";

export class PrismaClassRepository implements IClassRepository {
  async create(data: CreateClassData): Promise<Class> {
    const classData = await prisma.class.create({ data });
    return this.toClassEntity(classData);
  }

  async findById(id: string): Promise<Class | null> {
    const classData = await prisma.class.findUnique({ where: { id } });
    return classData ? this.toClassEntity(classData) : null;
  }

  async findBySchool(schoolId: string): Promise<Class[]> {
    const classes = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
    });
    return classes.map(this.toClassEntity);
  }

  async update(id: string, data: Partial<CreateClassData>): Promise<Class> {
    const classData = await prisma.class.update({
      where: { id },
      data,
    });
    return this.toClassEntity(classData);
  }

  async assignTeacher(classId: string, teacherId: string): Promise<Class> {
    const classData = await prisma.class.update({
      where: { id: classId },
      data: { teacherId },
    });
    return this.toClassEntity(classData);
  }

  private toClassEntity(prismaClass: any): Class {
    return new Class(
      prismaClass.id,
      prismaClass.name,
      prismaClass.section,
      prismaClass.schoolId,
      prismaClass.teacherId,
      prismaClass.createdAt
    );
  }
}
