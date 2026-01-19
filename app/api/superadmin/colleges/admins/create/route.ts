import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { schoolId, name, email, password, mobile } = await req.json();

    if (!schoolId || !name || !email || !password) {
      return NextResponse.json(
        { message: "School ID, name, email, and password are required" },
        { status: 400 }
      );
    }

    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();

    // Hash password
    const hashedPassword = await passwordService.hash(password);

    const useCase = new SuperAdminUseCase(schoolRepository, authRepository);

    const admin = await useCase.createAdmin({
      schoolId,
      name,
      email,
      password: hashedPassword,
      mobile: mobile || undefined,
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          schoolId: admin.schoolId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
