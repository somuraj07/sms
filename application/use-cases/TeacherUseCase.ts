import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IAuthRepository, CreateUserData } from "@/domain/repositories/IAuthRepository";
import { Teacher } from "@/domain/entities/Teacher.entity";
import { IPasswordService } from "@/domain/services/IPasswordService";

export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
  mobile: string | null;
  subjectsTaught: string | null;
  schoolId: string;
  isLeaveApprover: boolean;
}

export class TeacherUseCase {
  constructor(
    private readonly teacherRepository: ITeacherRepository,
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async createTeacher(request: CreateTeacherRequest): Promise<Teacher> {
    // Check if email exists
    const emailExists = await this.authRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(request.password);

    // Create user
    const userData: CreateUserData = {
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: "TEACHER",
      schoolId: request.schoolId,
    };
    const user = await this.authRepository.create(userData);

    // Create teacher
    const teacher = await this.teacherRepository.create({
      userId: user.id,
      schoolId: request.schoolId,
      mobile: request.mobile,
      subjectsTaught: request.subjectsTaught,
      isLeaveApprover: request.isLeaveApprover,
    });

    return teacher;
  }

  async getTeachersBySchool(schoolId: string): Promise<Teacher[]> {
    return this.teacherRepository.findBySchool(schoolId);
  }
}
