import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { AttendanceUseCase } from "@/application/use-cases/AttendanceUseCase";
import { PrismaAttendanceRepository } from "@/infrastructure/repositories/PrismaAttendanceRepository";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { classId, date, period, attendances } = await req.json();

    if (!classId || !date || !period || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { message: "Missing required fields: classId, date, period, and attendances array" },
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

    const repository = new PrismaAttendanceRepository();
    const useCase = new AttendanceUseCase(repository);

    const results = await useCase.markAttendance({
      classId,
      date: new Date(date),
      period,
      attendances,
      teacherId: session.user.id,
      schoolId,
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Attendance marked successfully", 
        data: results 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
