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

    const { roomNumber, capacity, benchesPerRow } = await req.json();

    if (!roomNumber || !capacity) {
      return NextResponse.json(
        { message: "Room number and capacity are required" },
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

    const room = await useCase.createRoom({
      roomNumber,
      capacity: parseInt(capacity),
      benchesPerRow: benchesPerRow ? parseInt(benchesPerRow) : null,
      schoolId,
    });

    return NextResponse.json(
      { message: "Exam room created successfully", room },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create exam room error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
