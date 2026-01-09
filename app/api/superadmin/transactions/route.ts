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

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Super admin can see all transactions across all colleges
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                subdomain: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to recent transactions
    });

    return NextResponse.json({
      success: true,
      data: payments.map((p) => ({
        id: p.id,
        studentName: p.student.user?.name,
        studentEmail: p.student.user?.email,
        schoolName: p.student.school.name,
        schoolId: p.student.school.id,
        schoolSubdomain: p.student.school.subdomain,
        amount: p.amount,
        status: p.status,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        date: p.createdAt,
      })),
      total: payments.length,
    });
  } catch (error: any) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
