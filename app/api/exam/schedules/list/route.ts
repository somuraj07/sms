import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PrismaExamRepository } from "@/infrastructure/repositories/PrismaExamRepository";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EXAMINER", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaExamRepository();

    let schedules;
    if (department) {
      schedules = await repository.findSchedulesByDepartment(schoolId, department);
    } else {
      schedules = await repository.findSchedulesBySchool(schoolId);
    }

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error: any) {
    console.error("List exam schedules error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
