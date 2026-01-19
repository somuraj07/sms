import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    // For teachers: get students and parents
    if (session.user.role === "TEACHER") {
      const students = await prisma.user.findMany({
        where: {
          schoolId,
          role: { in: ["STUDENT", "PARENT"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: students,
      });
    }

    // For students/parents: get teachers
    if (["STUDENT", "PARENT"].includes(session.user.role)) {
      const teachers = await prisma.user.findMany({
        where: {
          schoolId,
          role: "TEACHER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: teachers,
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error("List users error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
