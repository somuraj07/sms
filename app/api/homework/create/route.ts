import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { HomeworkUseCase } from "@/application/use-cases/HomeworkUseCase";
import { PrismaHomeworkRepository } from "@/infrastructure/repositories/PrismaHomeworkRepository";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, subject, classId, dueDate } = await req.json();

    if (!title || !description || !subject || !classId) {
      return NextResponse.json(
        { message: "Title, description, subject, and class are required" },
        { status: 400 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaHomeworkRepository();
    const useCase = new HomeworkUseCase(repository);

    const homework = await useCase.createHomework({
      title,
      description,
      subject,
      classId,
      teacherId: session.user.id,
      schoolId,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    // Enrich with relations
    const enriched = await prisma.homework.findUnique({
      where: { id: homework.id },
      include: {
        class: {
          select: { id: true, name: true, section: true },
        },
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Homework created successfully", 
        data: enriched 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create homework error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
