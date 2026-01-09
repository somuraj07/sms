import { IStudentRepository, CreateStudentData } from "@/domain/repositories/IStudentRepository";
import { Student } from "@/domain/entities/Student.entity";
import prisma from "@/lib/db";

export class PrismaStudentRepository implements IStudentRepository {
  async create(data: CreateStudentData): Promise<Student> {
    // Map admissionNo to AdmissionNo for Prisma schema
    const prismaData: any = {
      ...data,
      AdmissionNo: data.admissionNo,
    };
    delete prismaData.admissionNo;
    
    const student = await prisma.student.create({ data: prismaData });
    return this.toStudentEntity(student);
  }

  async findById(id: string): Promise<Student | null> {
    const student = await prisma.student.findUnique({ where: { id } });
    return student ? this.toStudentEntity(student) : null;
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const student = await prisma.student.findUnique({ where: { userId } });
    return student ? this.toStudentEntity(student) : null;
  }

  async findBySchool(schoolId: string, classId?: string): Promise<Student[]> {
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        ...(classId && { classId }),
      },
      orderBy: { AdmissionNo: "asc" },
    });
    return students.map(this.toStudentEntity);
  }

  async findByAdmissionNo(admissionNo: string, schoolId: string): Promise<Student | null> {
    const student = await prisma.student.findFirst({
      where: { AdmissionNo: admissionNo, schoolId },
    });
    return student ? this.toStudentEntity(student) : null;
  }

  async update(id: string, data: Partial<CreateStudentData>): Promise<Student> {
    // Map admissionNo to AdmissionNo for Prisma schema
    const prismaData: any = { ...data };
    if (prismaData.admissionNo !== undefined) {
      prismaData.AdmissionNo = prismaData.admissionNo;
      delete prismaData.admissionNo;
    }
    
    const student = await prisma.student.update({
      where: { id },
      data: prismaData,
    });
    return this.toStudentEntity(student);
  }

  async assignToClass(studentId: string, classId: string): Promise<Student> {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId },
    });
    return this.toStudentEntity(student);
  }

  async existsByAdmissionNo(admissionNo: string, schoolId: string): Promise<boolean> {
    const count = await prisma.student.count({
      where: { AdmissionNo: admissionNo, schoolId },
    });
    return count > 0;
  }

  async existsByAadhaar(aadhaarNo: string, schoolId: string): Promise<boolean> {
    const count = await prisma.student.count({
      where: { aadhaarNo, schoolId },
    });
    return count > 0;
  }

  private toStudentEntity(prismaStudent: any): Student {
    return new Student(
      prismaStudent.id,
      prismaStudent.userId,
      prismaStudent.schoolId,
      prismaStudent.classId,
      prismaStudent.AdmissionNo,
      prismaStudent.fatherName,
      prismaStudent.aadhaarNo,
      prismaStudent.phoneNo,
      prismaStudent.rollNo,
      prismaStudent.dob,
      prismaStudent.address,
      prismaStudent.gender,
      prismaStudent.createdAt,
      prismaStudent.updatedAt
    );
  }
}
