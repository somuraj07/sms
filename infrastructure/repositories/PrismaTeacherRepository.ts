import { ITeacherRepository, CreateTeacherData } from "@/domain/repositories/ITeacherRepository";
import { Teacher } from "@/domain/entities/Teacher.entity";
import prisma from "@/lib/db";

export class PrismaTeacherRepository implements ITeacherRepository {
  async create(data: CreateTeacherData): Promise<Teacher> {
    // Since Teacher is stored as User with role=TEACHER, we create a User
    // The User is already created in TeacherUseCase, so we just need to return the Teacher entity
    // This method is called after User creation, so we fetch the user
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return this.toTeacherEntity(user);
  }

  async findById(id: string): Promise<Teacher | null> {
    // id here is the userId (since Teacher entity uses userId)
    const user = await prisma.user.findUnique({ 
      where: { id },
      // Only return if role is TEACHER
    });
    if (!user || user.role !== "TEACHER") {
      return null;
    }
    return this.toTeacherEntity(user);
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "TEACHER") {
      return null;
    }
    return this.toTeacherEntity(user);
  }

  async findBySchool(schoolId: string): Promise<Teacher[]> {
    const users = await prisma.user.findMany({
      where: { 
        schoolId,
        role: "TEACHER",
      },
      orderBy: { createdAt: "desc" },
    });
    return users.map(this.toTeacherEntity);
  }

  async update(id: string, data: Partial<CreateTeacherData>): Promise<Teacher> {
    const updateData: any = {};
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.subjectsTaught !== undefined) updateData.subjectsTaught = data.subjectsTaught;
    if (data.isLeaveApprover !== undefined) updateData.leaveAprrover = data.isLeaveApprover;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.toTeacherEntity(user);
  }

  private toTeacherEntity(prismaUser: any): Teacher {
    return new Teacher(
      prismaUser.id, // Using userId as id for Teacher entity
      prismaUser.id, // userId
      prismaUser.schoolId || "",
      prismaUser.mobile,
      prismaUser.subjectsTaught,
      prismaUser.leaveAprrover || false,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}
