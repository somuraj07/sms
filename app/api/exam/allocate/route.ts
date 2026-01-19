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

    const { scheduleId, studentIds, department } = await req.json();

    if (!scheduleId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { message: "Schedule ID and student IDs array are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaExamRepository();
    const useCase = new ExamAllocationUseCase(repository);

    const allocations = await useCase.allocateStudents({
      scheduleId,
      studentIds,
      department,
    });

    return NextResponse.json(
      { message: "Students allocated successfully", allocations },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Allocate students error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
