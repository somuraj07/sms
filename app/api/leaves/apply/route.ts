import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { LeaveUseCase } from "@/application/use-cases/LeaveUseCase";
import { PrismaLeaveRepository } from "@/infrastructure/repositories/PrismaLeaveRepository";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { leaveType, reason, fromDate, toDate, days } = await req.json();

    if (!leaveType || !fromDate || !toDate || !days) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    const repository = new PrismaLeaveRepository();
    const useCase = new LeaveUseCase(repository);

    const leave = await useCase.createLeave({
      teacherId: session.user.id,
      schoolId,
      leaveType,
      reason,
      days,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Leave request created successfully",
        data: leave 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Apply leave error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
