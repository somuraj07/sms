import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { StudentUseCase } from "@/application/use-cases/StudentUseCase";
import { PrismaStudentRepository } from "@/infrastructure/repositories/PrismaStudentRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let schoolId = session.user.schoolId;

    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;

      if (schoolId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") || undefined;

    const studentRepository = new PrismaStudentRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();
    const useCase = new StudentUseCase(studentRepository, authRepository, passwordService);

    const students = await useCase.getStudentsBySchool(schoolId, classId);

    // Enrich with relations
    const enriched = await Promise.all(
      students.map(async (student) => {
        const studentData = await prisma.student.findUnique({
          where: { id: student.id },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            class: {
              select: { id: true, name: true, section: true },
            },
          },
        });
        return studentData;
      })
    );

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error("List students error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
