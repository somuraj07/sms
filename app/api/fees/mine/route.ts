import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT" || !session.user.studentId) {
    return NextResponse.json(
      { message: "Only students can view their fee details" },
      { status: 403 }
    );
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      include: {
        fee: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { name: true, email: true },
        },
        class: {
          select: { name: true, section: true },
        },
        school: {
          select: {
            name: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
      },
    });

    if (!student || !student.fee) {
      return NextResponse.json(
        { message: "Fee details not found for this student" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fee: student.fee,          
      student: student.user,     
      class: student.class,      
      school: student.school,   
      payments: student.payments 
    });
  } catch (error: any) {
    console.error("Fetch student fee error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
