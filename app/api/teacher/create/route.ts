import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { TeacherUseCase } from "@/application/use-cases/TeacherUseCase";
import { PrismaTeacherRepository } from "@/infrastructure/repositories/PrismaTeacherRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const { name, email, password, mobile, subjectsTaught, isLeaveApprover } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const teacherRepository = new PrismaTeacherRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();
    const useCase = new TeacherUseCase(teacherRepository, authRepository, passwordService);

    const teacher = await useCase.createTeacher({
      name,
      email,
      password,
      mobile: mobile || null,
      subjectsTaught: subjectsTaught || null,
      schoolId,
      isLeaveApprover: isLeaveApprover || false,
    });

    // Enrich with user data
    const user = await prisma.user.findUnique({
      where: { id: teacher.userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        subjectsTaught: true,
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Teacher created successfully", 
        data: user 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create teacher error:", error);

    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
