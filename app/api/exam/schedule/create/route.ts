import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ExamAllocationUseCase } from "@/application/use-cases/ExamAllocationUseCase";
import { PrismaExamRepository } from "@/infrastructure/repositories/PrismaExamRepository";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EXAMINER", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const {
      examType,
      examName,
      subject,
      department,
      className,
      roomId,
      examDate,
      startTime,
      endTime,
      studentsPerBench,
      invigilatorId,
    } = await req.json();

    if (!examType || !examName || !subject || !roomId || !examDate || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Required fields are missing" },
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

    const repository = new PrismaExamRepository();
    const useCase = new ExamAllocationUseCase(repository);

    const schedule = await useCase.createSchedule({
      examType,
      examName,
      subject,
      department: department || null,
      className: className || null,
      roomId,
      schoolId,
      examDate: new Date(examDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      studentsPerBench: studentsPerBench ? parseInt(studentsPerBench) : 1,
      invigilatorId: invigilatorId || null,
    });

    return NextResponse.json(
      { message: "Exam schedule created successfully", schedule },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create exam schedule error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
