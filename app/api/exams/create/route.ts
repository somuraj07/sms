import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { name, examType } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Exam name is required" },
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

    // Create exam with type in name if provided
    const examName = examType ? `${examType} - ${name}` : name;

    const exam = await prisma.exam.create({
      data: {
        name: examName,
        schoolId,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Exam created successfully",
        data: exam,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create exam error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
