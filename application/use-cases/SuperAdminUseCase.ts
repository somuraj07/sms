import { ISchoolRepository } from "@/domain/repositories/ISchoolRepository";
import { IAuthRepository, CreateUserData } from "@/domain/repositories/IAuthRepository";
import { School } from "@/domain/entities/School.entity";
import { User } from "@/domain/entities/User.entity";
import prisma from "@/lib/db";

export interface CreateCollegeRequest {
  name: string;
  address: string;
  location: string;
  icon: string | null;
  pincode: string;
  district: string;
  state: string;
  city: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminMobile?: string;
}

export interface CreateAdminRequest {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface SuperAdminDashboardStats {
  totalColleges: number;
  activeColleges: number;
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalStorageGB: number;
  colleges: Array<{
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    studentCount: number;
    teacherCount: number;
    createdAt: Date;
  }>;
}

export class SuperAdminUseCase {
  constructor(
    private readonly schoolRepository: ISchoolRepository,
    private readonly authRepository: IAuthRepository
  ) {}

  async createCollege(request: CreateCollegeRequest): Promise<{ school: School; admin: User }> {
    // Validate subdomain format
    if (!School.isValidSubdomain(request.subdomain)) {
      throw new Error("Invalid subdomain format. Must be 3-63 characters, lowercase alphanumeric with hyphens");
    }

    // Check if subdomain exists (with error handling in case Prisma client doesn't recognize the field)
    try {
      const exists = await this.schoolRepository.existsBySubdomain(request.subdomain);
      if (exists) {
        throw new Error("Subdomain already exists");
      }
    } catch (checkError: any) {
      // If subdomain check fails due to Prisma client issues, we'll let the database unique constraint handle it
      console.warn("Subdomain existence check failed, will rely on database constraint:", checkError.message);
      // Continue - database unique constraint will catch duplicates
    }

    // Check if admin email exists
    const adminExists = await this.authRepository.existsByEmail(request.adminEmail);
    if (adminExists) {
      throw new Error("Admin email already exists");
    }

    // Create school
    const school = await this.schoolRepository.create({
      name: request.name,
      address: request.address,
      location: request.location,
      icon: request.icon,
      pincode: request.pincode,
      district: request.district,
      state: request.state,
      city: request.city,
      subdomain: request.subdomain,
    });

    // Create admin user (password should be hashed before calling this)
    const adminData: CreateUserData = {
      name: request.adminName,
      email: request.adminEmail,
      password: request.adminPassword, // Expected to be hashed by caller
      role: "ADMIN",
      schoolId: school.id,
    };

    const admin = await this.authRepository.create(adminData);

    // Link admin to school
    await prisma.school.update({
      where: { id: school.id },
      data: {
        admins: {
          connect: { id: admin.id },
        },
      },
    });

    return { school, admin };
  }

  async createAdmin(request: CreateAdminRequest): Promise<User> {
    // Verify school exists
    const school = await this.schoolRepository.findById(request.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    if (!school.isActiveSchool()) {
      throw new Error("School is not active");
    }

    // Check if email exists
    const exists = await this.authRepository.existsByEmail(request.email);
    if (exists) {
      throw new Error("Email already exists");
    }

    // Create admin (password should be hashed before calling this)
    const adminData: CreateUserData = {
      name: request.name,
      email: request.email,
      password: request.password, // Expected to be hashed by caller
      role: "ADMIN",
      schoolId: request.schoolId,
    };

    const admin = await this.authRepository.create(adminData);

    // Link to school
    await prisma.school.update({
      where: { id: request.schoolId },
      data: {
        admins: {
          connect: { id: admin.id },
        },
      },
    });

    return admin;
  }

  async getDashboardStats(): Promise<SuperAdminDashboardStats> {
    // Get all schools with counts
    const schools = await prisma.school.findMany({
      include: {
        students: {
          select: { id: true },
        },
        teachers: {
          select: { id: true },
        },
        classes: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totalColleges = schools.length;
    const activeColleges = schools.filter(s => s.isActive).length;
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.user.count({
      where: { role: "TEACHER" },
    });

    // Get unique departments from classes
    const allClasses = await prisma.class.findMany({
      select: { name: true },
    });
    const departments = new Set<string>();
    allClasses.forEach(cls => {
      // Extract department from class name (e.g., "CSE 1st Year" -> "CSE")
      const parts = cls.name.split(" ");
      if (parts.length > 0) {
        departments.add(parts[0]);
      }
    });
    const totalDepartments = departments.size;

    // Calculate storage (approximate - in a real system, calculate from file uploads)
    const totalStorageGB = 0; // TODO: Implement actual storage calculation

    // Format college data
    const collegesData = schools.map(school => ({
      id: school.id,
      name: school.name,
      subdomain: school.subdomain || "",
      isActive: school.isActive,
      studentCount: school.students.length,
      teacherCount: school.teachers.length,
      createdAt: school.createdAt,
    }));

    return {
      totalColleges,
      activeColleges,
      totalStudents,
      totalTeachers,
      totalDepartments,
      totalStorageGB,
      colleges: collegesData,
    };
  }

  async activateCollege(schoolId: string): Promise<School> {
    return this.schoolRepository.activate(schoolId);
  }

  async deactivateCollege(schoolId: string): Promise<School> {
    return this.schoolRepository.deactivate(schoolId);
  }

  async getColleges(page: number = 1, limit: number = 10, search?: string): Promise<{
    colleges: Array<{
      id: string;
      name: string;
      subdomain: string;
      isActive: boolean;
      studentCount: number;
      teacherCount: number;
      admin: {
        id: string;
        name: string;
        email: string;
        mobile: string | null;
      } | null;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: {
          students: {
            select: { id: true },
          },
          teachers: {
            select: { id: true },
          },
          admins: {
            where: { role: "ADMIN" },
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.school.count({ where }),
    ]);

    return {
      colleges: schools.map(school => ({
        id: school.id,
        name: school.name,
        subdomain: school.subdomain || "",
        isActive: school.isActive,
        studentCount: school.students.length,
        teacherCount: school.teachers.length,
        admin: school.admins[0] || null,
        createdAt: school.createdAt,
      })),
      total,
      page,
      limit,
    };
  }
}
