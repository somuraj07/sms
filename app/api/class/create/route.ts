import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ClassUseCase } from "@/application/use-cases/ClassUseCase";
import { PrismaClassRepository } from "@/infrastructure/repositories/PrismaClassRepository";
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

    const { name, section, teacherId } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Class name is required" },
        { status: 400 }
      );
    }

    const repository = new PrismaClassRepository();
    const useCase = new ClassUseCase(repository);

    const classData = await useCase.createClass({
      name,
      section: section || null,
      schoolId,
      teacherId: teacherId || null,
    });

    // Enrich with relations for response
    const enriched = await prisma.class.findUnique({
      where: { id: classData.id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        school: {
          select: { id: true, name: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Class created successfully", 
        data: enriched 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Class creation error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
