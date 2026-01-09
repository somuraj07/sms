import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClassUseCase } from "@/application/use-cases/ClassUseCase";
import { PrismaClassRepository } from "@/infrastructure/repositories/PrismaClassRepository";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaClassRepository();
    const useCase = new ClassUseCase(repository);

    const classes = await useCase.getClassesBySchool(schoolId);

    // Enrich with relations for frontend
    const enriched = await Promise.all(
      classes.map(async (cls) => {
        const classData = await prisma.class.findUnique({
          where: { id: cls.id },
          include: {
            teacher: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { students: true },
            },
          },
        });
        return classData;
      })
    );

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error("List classes error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
