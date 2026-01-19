import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IAuthRepository, CreateUserData } from "@/domain/repositories/IAuthRepository";
import { Student } from "@/domain/entities/Student.entity";
import { Gender } from "@/domain/entities/Hostel.entity";
import { IPasswordService } from "@/domain/services/IPasswordService";
import prisma from "@/lib/db";

export interface CreateStudentRequest {
  name: string;
  email: string | null;
  fatherName: string;
  aadhaarNo: string;
  phoneNo: string;
  dob: Date;
  admissionNo: string;
  classId: string | null;
  address: string | null;
  gender: Gender;
  schoolId: string;
  totalFee: number;
  discountPercent: number;
}

export class StudentUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async createStudent(request: CreateStudentRequest): Promise<Student> {
    // Validate unique fields
    if (await this.studentRepository.existsByAdmissionNo(request.admissionNo, request.schoolId)) {
      throw new Error("Admission number already exists in this school");
    }

    if (await this.studentRepository.existsByAadhaar(request.aadhaarNo, request.schoolId)) {
      throw new Error("Aadhaar number already exists in this school");
    }

    if (request.email) {
      const emailExists = await this.authRepository.existsByEmail(request.email);
      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Validate fee
    if (request.totalFee <= 0) {
      throw new Error("Total fee must be a positive number");
    }

    if (request.discountPercent < 0 || request.discountPercent > 100) {
      throw new Error("Discount percent must be between 0 and 100");
    }

    // Generate password from DOB (YYYYMMDD)
    const dobDate = new Date(request.dob);
    const password = dobDate.toISOString().split("T")[0].replace(/-/g, "");
    const hashedPassword = await this.passwordService.hash(password);

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const userData: CreateUserData = {
        name: request.name,
        email: request.email || "",
        password: hashedPassword,
        role: "STUDENT",
        schoolId: request.schoolId,
      };
      const user = await this.authRepository.create(userData);

      // Create student
      const student = await this.studentRepository.create({
        userId: user.id,
        schoolId: request.schoolId,
        classId: request.classId,
        admissionNo: request.admissionNo,
        fatherName: request.fatherName,
        aadhaarNo: request.aadhaarNo,
        phoneNo: request.phoneNo,
        rollNo: null,
        dob: dobDate,
        address: request.address,
        gender: request.gender,
      });

      // Create fee record
      const finalFee = request.totalFee * (1 - request.discountPercent / 100);
      await tx.studentFee.create({
        data: {
          studentId: student.id,
          totalFee: request.totalFee,
          discountPercent: request.discountPercent,
          finalFee,
          amountPaid: 0,
          remainingFee: finalFee,
          installments: 3,
        },
      });

      return student;
    });

    return result;
  }

  async getStudentsBySchool(schoolId: string, classId?: string): Promise<Student[]> {
    return this.studentRepository.findBySchool(schoolId, classId);
  }

  async assignStudentToClass(studentId: string, classId: string, schoolId: string): Promise<Student> {
    // Verify class belongs to school
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!classData) {
      throw new Error("Class not found or doesn't belong to this school");
    }

    // Verify student belongs to school
    const student = await this.studentRepository.findById(studentId);
    if (!student || student.schoolId !== schoolId) {
      throw new Error("Student not found or doesn't belong to this school");
    }

    return this.studentRepository.assignToClass(studentId, classId);
  }
}
