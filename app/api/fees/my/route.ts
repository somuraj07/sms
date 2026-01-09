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

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Get student ID from user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        fee: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      fee: student.fee,
      payments: student.payments,
    });
  } catch (error: any) {
    console.error("Get my fees error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
