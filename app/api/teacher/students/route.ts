import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "School not found in session" },
        { status: 400 }
      );
    }

    // Get classes assigned to this teacher
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: session.user.id,
        schoolId: schoolId,
      },
      select: { id: true },
    });

    const classIds = teacherClasses.map(c => c.id);

    if (classIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get all students from these classes
    const students = await prisma.student.findMany({
      where: {
        classId: { in: classIds },
        schoolId: schoolId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: { id: true, name: true, section: true },
        },
      },
      orderBy: {
        AdmissionNo: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    console.error("Get teacher students error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
