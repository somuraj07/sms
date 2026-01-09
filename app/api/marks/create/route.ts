import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { MarkUseCase } from "@/application/use-cases/MarkUseCase";
import { PrismaMarkRepository } from "@/infrastructure/repositories/PrismaMarkRepository";
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

    const { studentId, classId, subject, marks, totalMarks, suggestions, examId } = await req.json();

    if (!studentId || !classId || !subject || marks === undefined || totalMarks === undefined || !examId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: studentId, classId, subject, marks, totalMarks, examId" },
        { status: 400 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "School not found in session" },
        { status: 400 }
      );
    }

    // Check if teacher teaches this subject
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subjectsTaught: true }
    });

    if (teacher?.subjectsTaught) {
      const subjects = teacher.subjectsTaught.split(",").map(s => s.trim());
      if (!subjects.includes(subject)) {
        return NextResponse.json(
          { success: false, message: `You can only enter marks for subjects you teach: ${teacher.subjectsTaught}` },
          { status: 403 }
        );
      }
    }

    const repository = new PrismaMarkRepository();
    const useCase = new MarkUseCase(repository);

    const mark = await useCase.createMark({
      studentId,
      classId,
      subject,
      marks: parseFloat(marks),
      totalMarks: parseFloat(totalMarks),
      suggestions: suggestions || null,
      examId,
      teacherId: session.user.id,
      schoolId,
    });

    // Enrich with relations
    const enriched = await prisma.mark.findUnique({
      where: { id: mark.id },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
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
        message: "Marks added successfully", 
        data: enriched 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create marks error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
